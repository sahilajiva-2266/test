const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const paginate = require("../../helpers/limitoffset");
const DeviceModel = require("./model");
const SettingsModel = require("../settings/model");
const DeviceEventModel = require("./deviceEventModel");
const UserModel = require("../user/model");
const EmployeeModel = require("../employees/model");
const PolicyModel = require("./policyModel");
const VisitorModel = require("../user/visitorModel");
const { sendEmail } = require("../../helpers/sendemail");
const PermissionLogModel = require("../permissions/permissionLogModel");
const { randomUUID } = require("crypto");
const axios = require("axios");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");

const JWT_SECRET =
  process.env.SECRET_KEY ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET;

const normalizeStatus = (value) => {
  const up = String(value || "").toUpperCase();
  if (["ONLINE", "OFFLINE", "BLOCKED"].includes(up)) return up;
  return "OFFLINE";
};

const normalizeNameForCompare = (value) =>
  String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const toDisplayName = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((part) =>
      part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : ""
    )
    .join(" ");

const buildDefaultRfid = (employeeId) => {
  const cleanId = String(employeeId || "EMP").trim() || "EMP";
  const suffix = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `RFID-${cleanId}-${suffix}`;
};

const generateUniqueRfid = async (employeeId, maxAttempts = 5) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const candidate = buildDefaultRfid(employeeId);
    const [employeeExists, visitorExists] = await Promise.all([
      EmployeeModel.exists({ rfid: candidate }),
      VisitorModel.exists({ rfid: candidate }),
    ]);
    if (!employeeExists && !visitorExists) return candidate;
  }
  throw new Error("Unable to generate a unique RFID");
};

const ensureEmployeeDefaults = async (employee, employeeId) => {
  if (!employee?._id) return employee;
  const updates = {};
  if (!employee.rfid) {
    updates.rfid = await generateUniqueRfid(employeeId);
  }
  if (!employee.section) {
    updates.section = "General";
  }
  if (!Object.keys(updates).length) {
    return employee;
  }
  const updated = await EmployeeModel.findByIdAndUpdate(employee._id, {
    $set: updates,
  }, { new: true });
  return updated || employee;
};

const ensureVisitorDefaults = async (visitor, visitorEmployeeId) => {
  if (!visitor?._id) return visitor;
  const updates = {};
  if (!visitor.rfid) {
    updates.rfid = await generateUniqueRfid(visitorEmployeeId || visitor.employeeId);
  }
  if (!Object.keys(updates).length) {
    return visitor;
  }
  const updated = await VisitorModel.findByIdAndUpdate(visitor._id, {
    $set: updates,
  }, { new: true });
  return updated || visitor;
};

const normalizeDeviceId = (value) => String(value || "").trim();
const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applyDefaultAppPolicies = async (device) => {
  const settings = await SettingsModel.findOne({ unitLocation: "" }).lean();
  const appSettings =
    settings?.deviceControls?.appSettings || settings?.appSettings || [];
  const activeSettings = appSettings.filter(
    (setting) => setting && setting.active && setting.appKey
  );
  if (!activeSettings.length) return;

  const update = {};
  activeSettings.forEach((setting) => {
    update[`devicePolicyState.${setting.appKey}`] = !!setting.block;
  });

  await DeviceModel.updateOne({ _id: device._id }, { $set: update });
  device.devicePolicyState = {
    ...(device.devicePolicyState || {}),
    ...Object.keys(update).reduce((acc, key) => {
      acc[key.replace("devicePolicyState.", "")] = update[key];
      return acc;
    }, {}),
  };
};
const padVisitorId = (seq) => `VIS-${String(seq).padStart(5, "0")}`;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "pidilite-cd009";
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  "..",
  "..",
  "config",
  "serviceAccountKey.json"
);

const resolveServiceAccountPath = () => {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!envPath) return DEFAULT_SERVICE_ACCOUNT_PATH;
  return path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
};

const getNextVisitorId = async () => {
  const counters = mongoose.connection.collection("counters");
  const result = await counters.findOneAndUpdate(
    { _id: "visitor" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = result?.value?.seq || 1;
  return padVisitorId(seq);
};

const getMaxVisitorSeq = async () => {
  const doc = await VisitorModel.findOne({
    employeeId: /^VIS-\d{5}$/,
  })
    .sort({ employeeId: -1 })
    .select("employeeId")
    .lean();
  if (!doc?.employeeId) return 0;
  const match = String(doc.employeeId).match(/^VIS-(\d{5})$/);
  return match ? Number(match[1]) : 0;
};

const ensureVisitorCounterUpToDate = async () => {
  const maxSeq = await getMaxVisitorSeq();
  const counters = mongoose.connection.collection("counters");
  await counters.findOneAndUpdate(
    { _id: "visitor" },
    { $max: { seq: maxSeq } },
    { upsert: true }
  );
};

const createVisitorWithRetry = async ({ name, deviceId }, maxAttempts = 5) => {
  let syncedCounter = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const visitorEmployeeId = await getNextVisitorId();
    try {
      const rfid = await generateUniqueRfid(visitorEmployeeId);
      return await VisitorModel.create({
        name: String(name).trim(),
        employeeId: visitorEmployeeId,
        rfid,
        deviceId,
        role: "visitor",
      });
    } catch (error) {
      const isDuplicate =
        error?.code === 11000 &&
        (error?.keyPattern?.employeeId || /employeeId/.test(String(error?.message)));
      if (!isDuplicate || attempt === maxAttempts) {
        throw error;
      }
      if (!syncedCounter) {
        await ensureVisitorCounterUpToDate();
        syncedCounter = true;
        continue;
      }

      const maxSeq = await getMaxVisitorSeq();
      const fallbackEmployeeId = padVisitorId(maxSeq + 1);
      try {
        const rfid = await generateUniqueRfid(fallbackEmployeeId);
        const created = await VisitorModel.create({
          name: String(name).trim(),
          employeeId: fallbackEmployeeId,
          rfid,
          deviceId,
          role: "visitor",
        });
        const counters = mongoose.connection.collection("counters");
        await counters.findOneAndUpdate(
          { _id: "visitor" },
          { $max: { seq: maxSeq + 1 } },
          { upsert: true }
        );
        return created;
      } catch (fallbackError) {
        if (attempt === maxAttempts) {
          throw fallbackError;
        }
      }
    }
  }
  return null;
};


const boolOrDefault = (value, defaultValue) =>
  typeof value === "boolean" ? value : defaultValue;

const toValidDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }
  const str = String(value).trim();
  if (!str) return undefined;
  // Trim microseconds to milliseconds if present (e.g. 2025-12-22T12:07:02.922527)
  const normalized = str.replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? undefined : d;
};

const cleanUpdate = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const formatDevice = (doc) => {
  const d = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...d,
    id: d._id?.toString?.() || d.id,
    name: d.name,
    deviceId: d.deviceId || d._id,
    userName:
      d.userId?.name ||
      (d.userId && (d.userId.firstName || d.userId.lastName)
        ? `${d.userId.firstName || ""} ${d.userId.lastName || ""}`.trim()
        : d.userId?.email),
    statusLabel:
      (d.status || "").toUpperCase() === "ONLINE"
        ? "Online"
        : (d.status || "").toUpperCase() === "BLOCKED"
          ? "Blocked"
          : "Offline",
    deviceStatus: d.deviceStatus,
    cameraDisabled: d.devicePolicyState?.cameraDisabled ?? false,
    uninstallBlocked: d.devicePolicyState?.uninstallBlocked ?? false,
    facebookBlocked: d.devicePolicyState?.facebookBlocked ?? false,
    instagramBlocked: d.devicePolicyState?.instagramBlocked ?? false,
    youtubeBlocked: d.devicePolicyState?.youtubeBlocked ?? false,
    whatsappBlocked: d.devicePolicyState?.whatsappBlocked ?? false,
    androidVersion: d.osVersion,
    appVer: d.appVersion,
    verified: !!d.verified,
  };
};

const getAccessToken = async () => {
  const auth = new GoogleAuth({
    keyFile: resolveServiceAccountPath(),
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const tokenObj = await client.getAccessToken();
  if (!tokenObj || !tokenObj.token) {
    throw new Error("No access token returned from GoogleAuth");
  }
  return tokenObj.token;
};

const sendDeviceNotification = async (device, title, body, data = {}) => {
  if (!device?.fcmToken) return;
  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
  const message = {
    message: {
      token: device.fcmToken,
      notification: { title, body },
      data,
    },
  };

  const accessToken = await getAccessToken();
  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Device notification sent:", {
        deviceId: device.deviceId || device._id,
        title,
        fcmName: response?.data?.name,
      });
    }
    return response?.data;
  } catch (error) {
    const fcmError =
      error?.response?.data || error?.message || "Unknown FCM error";
    console.warn("❌ Device notification failed:", fcmError);
    throw error;
  }
};

const sendAuthorizationEmail = async (userId, actionMessage) => {
  if (!userId) return;
  const user = await UserModel.findById(userId).lean();
  if (!user?.email) return;
  await sendEmail("authorization.html", user.email, {
    USER_NAME: user.name || "User",
    ACTION_MESSAGE: actionMessage,
  });
};

const logPermission = async ({ userId, employeeId, adminId, permission }) => {
  if (!userId || !adminId || !permission) return;
  await PermissionLogModel.create({
    userId,
    employeeId: employeeId || "",
    adminId,
    permission,
  });
};

const getAuthorizationNotification = (field) => {
  switch (field) {
    case "uninstallBlocked":
      return {
        title: "App Uninstall Authorized",
        message: "You are authorized to uninstall the app.",
        permission: "app_uninstall",
      };
    case "cameraDisabled":
      return {
        title: "Camera Access Authorized",
        message: "You are authorized to access the camera.",
        permission: "camera_access",
      };
    case "facebookBlocked":
      return {
        title: "Facebook Access Authorized",
        message: "You are authorized to access Facebook.",
        permission: "facebook_access",
      };
    case "instagramBlocked":
      return {
        title: "Instagram Access Authorized",
        message: "You are authorized to access Instagram.",
        permission: "instagram_access",
      };
    case "youtubeBlocked":
      return {
        title: "YouTube Access Authorized",
        message: "You are authorized to access YouTube.",
        permission: "youtube_access",
      };
    case "whatsappBlocked":
      return {
        title: "WhatsApp Access Authorized",
        message: "You are authorized to access WhatsApp.",
        permission: "whatsapp_access",
      };
    default:
      return null;
  }
};

const upsertDevice = async (payload) => {
  const {
    deviceId,
    userId,
    employeeId,
    deviceName,
    name,
    deviceStatus,
    type,
    platform,
    model,
    browser,
    osVersion,
    appVersion,
    fcmToken,
    isDeviceOwner,
    deviceInfo,
    devicePolicyState,
    status,
    deviceOwner,
    locationAllowed,
    lastScreenshotAt,
    enrollmentDate,
    lastSeen,
    deviceLocation,
    createdAt,
    metadata = {},
    raw = {},
    verified,
  } = payload;

  if (!userId) {
    throw new Error("userId is required");
  }

  const normalizedStatus = normalizeStatus(status || "ONLINE");
  const now = new Date();

  let filter = cleanUpdate({
    userId,
    deviceName,
    name,
    platform,
  });

  if (deviceId) {
    const normalized = normalizeDeviceId(deviceId);
    const orFilters = [{ deviceId: new RegExp(`^${normalized}$`, "i") }];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }
    filter = { $or: orFilters };
  }

  const updateSet = cleanUpdate({
    userId,
    employeeId,
    deviceId,
    deviceName,
    name,
    deviceStatus,
    type: type || "MOBILE",
    platform,
    model,
    browser,
    osVersion,
    appVersion,
    fcmToken,
    isDeviceOwner: typeof isDeviceOwner === "boolean" ? isDeviceOwner : undefined,
    deviceInfo,
    devicePolicyState,
    status: normalizedStatus,
    lastOnline: normalizedStatus === "ONLINE" ? now : undefined,
    enrollmentDate: toValidDate(enrollmentDate),
    lastSeen: toValidDate(lastSeen),
    deviceLocation,
    deviceOwner,
    locationAllowed: boolOrDefault(locationAllowed, true),
    lastScreenshotAt: toValidDate(lastScreenshotAt),
    metadata,
    raw,
    verified: typeof verified === "boolean" ? verified : undefined,
  });

  const createdAtDate = toValidDate(createdAt);
  const updateDoc = {
    $set: updateSet,
    ...(createdAtDate ? { $setOnInsert: { createdAt: createdAtDate } } : {}),
  };

  const result = await DeviceModel.findOneAndUpdate(filter, updateDoc, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
    rawResult: true,
  });

  let doc = result?.value;
  if (doc && typeof doc.populate === "function") {
    await doc.populate("userId");
  }
  if (!doc) {
    doc = await DeviceModel.findOne(filter).populate("userId");
  }

  const wasInserted = !!result?.lastErrorObject?.upserted;
  if (process.env.NODE_ENV !== "production") {
    const id = doc?._id ? doc._id.toString() : "unknown";
    console.log(
      `Device upsert ${wasInserted ? "inserted" : "updated"}: ${id}`
    );
  }

  if (doc && wasInserted) {
    try {
      await applyDefaultAppPolicies(doc);
    } catch (error) {
      console.warn("Failed to apply default app policies:", error.message);
    }
  }

  return { device: doc, wasInserted };
};

// Track or upsert device info (used on login or heartbeats)
exports.track = async (req, res) => {
  try {
    const { userId, employeeId, deviceId } = req.body || {};
    if (!userId || !employeeId || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "userId, employeeId and deviceId are required",
      });
    }
    const { device } = await upsertDevice(req.body);
    return res.status(200).json({
      status: true,
      message: "Device tracked",
      data: {
        deviceId: device.deviceId || device._id,
        userId: device.userId?._id || device.userId,
        deviceStatus: device.deviceStatus,
        verified: !!device.verified,
        devicePolicyState: device.devicePolicyState || {},
        deviceLocation: device.deviceLocation || null,
      },
    });
  } catch (error) {
    const details = error && error.stack ? error.stack : error;
    console.error("Device register failed:", details);
    return res.status(500).json({
      status: false,
      message: error.message || "Device register failed",
    });
  }
};

// Alias for creating/upserting from admin UI
exports.add = async (req, res) => exports.track(req, res);

// Step 1: Register device (no OTP yet)
exports.register = async (req, res) => {
  try {
    const {
      name,
      employeeId,
      deviceId,
      deviceName,
      platform,
      model,
      osVersion,
      appVersion,
      fcmToken,
      isDeviceOwner,
      deviceInfo,
      devicePolicyState,
      createdAt,
      lastSeen,
      deviceOwner,
    } = req.body;

    if (!name || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "name and deviceId are required",
      });
    }

    let user = null;
    let employee = null;
    let effectiveEmployeeId = employeeId;
    let isVisitor = false;
    let visitor = null;

    if (employeeId) {
      const normalizedName = String(name).trim();
      const displayName = toDisplayName(normalizedName);
      employee = await EmployeeModel.findOne({ employeeId });
      if (!employee) {
        user = await UserModel.create({
          name: displayName,
          employeeId,
          email: null,
        });
        const rfid = await generateUniqueRfid(employeeId);
        employee = await EmployeeModel.create({
          name: displayName,
          employeeId,
          userId: user._id,
          email: null,
          rfid,
          section: "General",
        });
        employee = await ensureEmployeeDefaults(employee, employeeId);
      } else {
        user = employee.userId
          ? await UserModel.findById(employee.userId)
          : await UserModel.findOne({ employeeId });
        if (!user) {
          user = await UserModel.create({
            name: displayName || employee.name,
            employeeId,
            email: null,
          });
          await EmployeeModel.updateOne(
            { _id: employee._id },
            { $set: { userId: user._id } }
          );
        }
        employee = await ensureEmployeeDefaults(employee, employeeId);
        const normalizedNameLower = normalizeNameForCompare(normalizedName);
        const employeeName = normalizeNameForCompare(
          employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`
        );
        if (normalizedNameLower !== employeeName) {
          return res.status(400).json({
            status: false,
            message: "Name does not match the employeeId",
          });
        }
      }
    } else {
      isVisitor = true;
      const normalizedDeviceId = normalizeDeviceId(deviceId);
      visitor = await VisitorModel.findOne({ deviceId: normalizedDeviceId });
      if (!visitor) {
        visitor = await createVisitorWithRetry({
          name: toDisplayName(name),
          deviceId: normalizedDeviceId,
        });
      }
      if (visitor?.name) {
        const displayName = toDisplayName(visitor.name);
        if (displayName && displayName !== visitor.name) {
          visitor = await VisitorModel.findByIdAndUpdate(
            visitor._id,
            { $set: { name: displayName } },
            { new: true }
          );
        }
      }
      visitor = await ensureVisitorDefaults(visitor, visitor?.employeeId);
      user = visitor;
      effectiveEmployeeId = visitor.employeeId;
    }

    // Prevent assigning a new device if the user already has an Active device
    const activeFilter = {
      userId: user._id,
      deviceStatus: "Active",
    };
    if (deviceId && mongoose.isValidObjectId(deviceId)) {
      activeFilter._id = { $ne: deviceId };
    }
    const activeDevice = await DeviceModel.findOne(activeFilter);
    if (activeDevice) {
      return res.status(400).json({
        status: false,
        message: "User already has an active device assigned",
      });
    }

    if (deviceId) {
      const normalizedDeviceId = normalizeDeviceId(deviceId);
      const existingDevice = await DeviceModel.findOne({
        $or: [
          { deviceId: new RegExp(`^${normalizedDeviceId}$`, "i") },
          ...(mongoose.isValidObjectId(deviceId) ? [{ _id: deviceId }] : []),
        ],
      });
      if (
        existingDevice &&
        existingDevice.userId &&
        existingDevice.userId.toString() !== user._id.toString() &&
        existingDevice.deviceStatus === "Active"
      ) {
        return res.status(409).json({
          status: false,
          message: "Device already assigned to another user",
        });
      }
    }

    const { device, wasInserted } = await upsertDevice({
      userId: user._id,
      employeeId: effectiveEmployeeId,
      deviceId,
      deviceName: deviceName || deviceId,
      name,
      platform,
      model,
      osVersion,
      appVersion,
      fcmToken,
      isDeviceOwner,
      deviceInfo,
      devicePolicyState,
      createdAt,
      lastSeen,
      deviceOwner,
      status: "OFFLINE",
      verified: false,
    });

    if (employeeId) {
      const latestEmployee = await EmployeeModel.findOne({ employeeId });
      if (latestEmployee) {
        employee = await ensureEmployeeDefaults(latestEmployee, employeeId);
        if (!employee?.rfid) {
          const fallbackRfid = await generateUniqueRfid(employeeId);
          const updated = await EmployeeModel.findByIdAndUpdate(
            latestEmployee._id,
            { $set: { rfid: fallbackRfid } },
            { new: true }
          );
          employee = updated || { ...latestEmployee.toObject?.(), rfid: fallbackRfid };
        }
      }
    }

    if (!device || !device._id) {
      return res.status(500).json({
        status: false,
        message: "Device register failed: no document returned from DB",
      });
    }

    await DeviceEventModel.create({
      deviceId: device._id,
      event: "app_install",
      name: user?.name || device.ownerName || "",
      employeeId: effectiveEmployeeId || "",
      timestamp: new Date(),
      policyVoilation: true,
      metadata: {
        policyVoilation: true,
        deviceId: device.deviceId || device._id,
        action: "install",
        source: "device_register",
      },
      raw: {
        deviceId,
        userId: user?._id,
        employeeId: effectiveEmployeeId,
      },
    });

    console.log("Device register saved:", device._id.toString());
    const deviceToken = jwt.sign(
      {
        deviceId: device.deviceId || device._id,
        userId: user._id,
        employeeId: effectiveEmployeeId,
        fcmToken: fcmToken || device.fcmToken || null,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      status: true,
      message: isVisitor
        ? "Visitor device registered successfully. Proceed to send OTP."
        : "Device registered successfully. Proceed to send OTP.",
      deviceId: device._id,
      userId: user._id,
      employeeId: effectiveEmployeeId,
      rfid: isVisitor ? (visitor?.rfid || null) : (employee?.rfid || null),
      verified: !!device.verified,
      deviceToken,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Verify device register token to allow skipping OTP on future launches
exports.verifyRegisterToken = async (req, res) => {
  try {
    const token = String(req.body.registerToken || "").trim();
    const deviceId = String(req.body.deviceId || "").trim();
    if (!token || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "deviceId and registerToken are required",
      });
    }

    const orFilters = [{ deviceId: new RegExp(`^${normalizeDeviceId(deviceId)}$`, "i") }];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }
    const device = await DeviceModel.findOne({ $or: orFilters });
    if (!device || !device.registerToken) {
      return res.status(404).json({ status: false, message: "Device not registered" });
    }
    if (device.registerToken !== token) {
      return res.status(401).json({ status: false, message: "Invalid register token" });
    }

    return res.status(200).json({
      status: true,
      message: "Device verified",
      data: {
        deviceId: device._id,
        employeeId: device.employeeId,
        userId: device.userId,
        verified: !!device.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get or update device status/settings for a user/device pair
exports.deviceStatus = async (req, res) => {
  try {
    const { userId, deviceId } = req.query || {};
    if (!userId || !deviceId) {
      return res.status(400).json({
        status: false,
        message: "userId and deviceId are required",
      });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ status: false, message: "userId must be valid" });
    }

    const normalizedDeviceId = normalizeDeviceId(deviceId);
    const orFilters = [
      { deviceId: new RegExp(`^${escapeRegExp(normalizedDeviceId)}$`, "i") },
    ];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }

    const device = await DeviceModel.findOne({ userId, $or: orFilters });
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const updatedDevice = device.toObject?.() || device;
    const deviceToken = jwt.sign(
      {
        deviceId: updatedDevice.deviceId || updatedDevice._id,
        userId: updatedDevice.userId,
        employeeId: updatedDevice.employeeId || null,
        fcmToken: updatedDevice.fcmToken || null,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      status: true,
      message: "Device status fetched",
      data: {
        userId: updatedDevice.userId,
        deviceId: updatedDevice.deviceId || updatedDevice._id,
        deviceLocation: updatedDevice.deviceLocation || null,
        deviceToken,
        deviceSettings: {
          deviceStatus: updatedDevice.deviceStatus,
          cameraDisabled: updatedDevice.devicePolicyState?.cameraDisabled ?? false,
          uninstallBlocked: updatedDevice.devicePolicyState?.uninstallBlocked ?? false,
          facebookBlocked: updatedDevice.devicePolicyState?.facebookBlocked ?? false,
          instagramBlocked: updatedDevice.devicePolicyState?.instagramBlocked ?? false,
          youtubeBlocked: updatedDevice.devicePolicyState?.youtubeBlocked ?? false,
          whatsappBlocked: updatedDevice.devicePolicyState?.whatsappBlocked ?? false,
          locationAllowed: updatedDevice.locationAllowed ?? true,
          devicePolicyState: updatedDevice.devicePolicyState || {},
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};


// List devices for the UI grid
exports.getAll = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);

    const filter = {};
    if (status) filter.status = normalizeStatus(status);

    const result = await paginate(
      DeviceModel,
      filter,
      pageNumber,
      limit,
      ["userId"],
      ["deviceName", "employeeId", "model", "appVersion", "osVersion"],
      search
    );

    const devices = result.data.map(formatDevice);

    return res.status(200).json({
      status: result.status,
      message: result.message,
      devices,
      total: result.pagination?.totalrecords || 0,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Detail view for the device modal
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { deviceName: id };

    const device = await DeviceModel.findOne(query).populate("userId");
    if (!device) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Record fetched",
      data: formatDevice(device),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Assign or update policy for a device
exports.setDevicePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policyData = req.body || {};

    const device = await DeviceModel.findById(id);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const previousState = { ...(device.devicePolicyState || {}) };

    let policy;
    if (device.policyId) {
      policy = await PolicyModel.findByIdAndUpdate(
        device.policyId,
        { rules: policyData },
        { new: true }
      );
    } else {
      policy = await PolicyModel.create({
        name: `Policy-${device.deviceId || device._id}`,
        rules: policyData,
      });
      device.policyId = policy._id;
    }

    device.devicePolicyState = { ...policyData };
    await device.save();

    const shouldAuthorizeUninstall =
      previousState.uninstallBlocked === true && policyData.uninstallBlocked === false;
    const shouldAuthorizeCamera =
      previousState.cameraDisabled === true && policyData.cameraDisabled === false;
    const shouldAuthorizeFacebook =
      previousState.facebookBlocked === true && policyData.facebookBlocked === false;
    const shouldAuthorizeInstagram =
      previousState.instagramBlocked === true && policyData.instagramBlocked === false;
    const shouldAuthorizeYoutube =
      previousState.youtubeBlocked === true && policyData.youtubeBlocked === false;
    const shouldAuthorizeWhatsapp =
      previousState.whatsappBlocked === true && policyData.whatsappBlocked === false;

    try {
      const fieldsToAuthorize = [];
      if (shouldAuthorizeUninstall) fieldsToAuthorize.push("uninstallBlocked");
      if (shouldAuthorizeCamera) fieldsToAuthorize.push("cameraDisabled");
      if (shouldAuthorizeFacebook) fieldsToAuthorize.push("facebookBlocked");
      if (shouldAuthorizeInstagram) fieldsToAuthorize.push("instagramBlocked");
      if (shouldAuthorizeYoutube) fieldsToAuthorize.push("youtubeBlocked");
      if (shouldAuthorizeWhatsapp) fieldsToAuthorize.push("whatsappBlocked");

      for (const field of fieldsToAuthorize) {
        const notification = getAuthorizationNotification(field);
        if (!notification) continue;
        await Promise.allSettled([
          sendAuthorizationEmail(device.userId, notification.message).catch((error) => {
            console.warn("Authorization email failed:", error.message);
          }),
          sendDeviceNotification(
            device,
            notification.title,
            notification.message,
            { permission: notification.permission }
          ).catch((error) => {
            console.warn(
              "Authorization notification failed:",
              error?.response?.data || error.message
            );
          }),
        ]);
        await logPermission({
          userId: device.userId,
          employeeId: device.employeeId,
          adminId: req.user?._id,
          permission: notification.permission,
        });
      }
    } catch (error) {
      console.warn("Authorization delivery failed:", error.message);
    }

    return res.status(200).json({
      status: true,
      message: "Policy assigned successfully",
      policy,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Toggle a single policy flag on a device
exports.toggleDevicePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body || {};
    const allowedFields = [
      "cameraDisabled",
      "uninstallBlocked",
      "facebookBlocked",
      "instagramBlocked",
      "youtubeBlocked",
      "whatsappBlocked",
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ status: false, message: "Invalid policy field" });
    }

    const device = await DeviceModel.findById(id);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const current = device.devicePolicyState?.[field] ?? false;
    const nextValue = !current;
    device.devicePolicyState = {
      ...(device.devicePolicyState || {}),
      [field]: nextValue,
    };
    await device.save();

    if (current === true && nextValue === false) {
      try {
        const notification = getAuthorizationNotification(field);
        if (notification) {
          await Promise.allSettled([
            sendAuthorizationEmail(device.userId, notification.message).catch(
              (error) => {
                console.warn("Authorization email failed:", error.message);
              }
            ),
            sendDeviceNotification(
              device,
              notification.title,
              notification.message,
              { permission: notification.permission }
            ).catch((error) => {
              console.warn(
                "Authorization notification failed:",
                error?.response?.data || error.message
              );
            }),
          ]);
          await logPermission({
            userId: device.userId,
            employeeId: device.employeeId,
            adminId: req.user?._id,
            permission: notification.permission,
          });
        }
      } catch (error) {
        console.warn("Authorization delivery failed:", error.message);
      }
    }

    if (device.policyId) {
      await PolicyModel.findByIdAndUpdate(
        device.policyId,
        { $set: { [`rules.${field}`]: nextValue } },
        { new: true }
      );
    }

    return res.status(200).json({
      status: true,
      message: "Policy updated",
      data: formatDevice(device),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Send a test push notification to a device
exports.sendTestNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body || {};

    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { deviceId: new RegExp(`^${escapeRegExp(normalizeDeviceId(id))}$`, "i") };
    const device = await DeviceModel.findOne(query);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }
    if (!device.fcmToken) {
      return res.status(400).json({ status: false, message: "Device FCM token missing" });
    }

    const fcmResponse = await sendDeviceNotification(
      device,
      title || "Test Notification",
      message || "This is a test notification."
    );

    return res.status(200).json({
      status: true,
      message: "Test notification sent",
      data: {
        deviceId: device.deviceId || device._id,
        fcmTokenLast4: device.fcmToken ? device.fcmToken.slice(-4) : null,
        fcmResponse: fcmResponse || null,
      },
    });
  } catch (error) {
    console.error("Test notification failed:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Fetch policy and applied state for a device
exports.getDevicePolicy = async (req, res) => {
  try {
    const device = await DeviceModel.findById(req.params.id)
      .populate("policyId")
      .lean();

    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    return res.status(200).json({
      status: true,
      data: {
        policy: device.policyId || null,
        appliedState: device.devicePolicyState || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Uninstall device (deactivate) by deviceId + userId validation
exports.uninstallDevice = async (req, res) => {
  try {
    const { deviceId, userId, employeeId, action } = req.body || {};

    if (!deviceId || !userId) {
      return res.status(400).json({
        status: false,
        message: "deviceId and userId are required",
      });
    }
    if (action && String(action).toLowerCase() !== "uninstall") {
      return res.status(400).json({ status: false, message: "Invalid action" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ status: false, message: "userId must be valid" });
    }

    const normalizedDeviceId = normalizeDeviceId(deviceId);
    const orFilters = [
      { deviceId: new RegExp(`^${escapeRegExp(normalizedDeviceId)}$`, "i") },
    ];
    if (mongoose.isValidObjectId(deviceId)) {
      orFilters.push({ _id: deviceId });
    }

    const device = await DeviceModel.findOne({ $or: orFilters });
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    if (String(device.userId) !== String(userId)) {
      return res.status(403).json({ status: false, message: "User not authorized for this device" });
    }
    if (employeeId && String(device.employeeId || "") !== String(employeeId)) {
      return res.status(403).json({ status: false, message: "Employee not authorized for this device" });
    }

    const user = await UserModel.findById(userId).lean();
    const employee =
      employeeId
        ? await EmployeeModel.findOne({ employeeId }).lean()
        : await EmployeeModel.findOne({ userId }).lean();
    const policyVoilation = !!device.devicePolicyState?.uninstallBlocked;

    await DeviceEventModel.create({
      deviceId: device._id,
      event: "app_uninstall",
      name: user?.name || device.ownerName || "",
      employeeId: employee?.employeeId || device.employeeId || employeeId || "",
      timestamp: new Date(),
      policyVoilation,
      metadata: {
        policyVoilation,
        deviceId: device.deviceId || device._id,
        action: "uninstall",
      },
      raw: {
        deviceId,
        userId,
        employeeId,
        action,
      },
    });

    await DeviceModel.deleteOne({ _id: device._id });

    return res.status(200).json({
      status: true,
      message: "Device removed successfully",
      data: {
        deviceId: device.deviceId || device._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Admin delete device by id or deviceId
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: false, message: "id is required" });
    }

    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { deviceId: new RegExp(`^${escapeRegExp(normalizeDeviceId(id))}$`, "i") };

    const device = await DeviceModel.findOne(query);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    await DeviceModel.deleteOne({ _id: device._id });

    return res.status(200).json({
      status: true,
      message: "Device deleted successfully",
      data: { deviceId: device.deviceId || device._id },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
