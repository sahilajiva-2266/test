const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const DeviceEvent = require("./deviceEventModel");
const DeviceModel = require("./model");
const ActivityModel = require("../activity/model");
const UserModel = require("../user/model");
const UserSession = require("../user/userSessionsModel");
const EmployeeModel = require("../employees/model");
const VisitorModel = require("../user/visitorModel");
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
const normalizeDeviceId = (value) => String(value || "").trim();
const resolveActivityCategory = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("accessibility")) return "app_install";
  if (value.includes("camera")) return "camera";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  return "other";
};

const isCameraEvent = (eventType) =>
  /camera|screenshot|video/i.test(String(eventType || ""));

const resolveUserSessionStatus = async ({ userId, employeeId }) => {
  if (userId && mongoose.isValidObjectId(userId)) {
    const user = await UserModel.findById(userId)
      .select("sessionStatus")
      .lean();
    if (user) return user.sessionStatus;
  }
  if (employeeId) {
    const user = await UserModel.findOne({ employeeId })
      .select("sessionStatus")
      .lean();
    if (user) return user.sessionStatus;
  }
  if (userId && mongoose.isValidObjectId(userId)) {
    const visitor = await VisitorModel.findById(userId)
      .select("sessionStatus")
      .lean();
    if (visitor) return visitor.sessionStatus;
  }
  if (employeeId) {
    const visitor = await VisitorModel.findOne({ employeeId })
      .select("sessionStatus")
      .lean();
    if (visitor) return visitor.sessionStatus;
  }
  if (userId && mongoose.isValidObjectId(userId)) {
    const session = await UserSession.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("action")
      .lean();
    if (session) return session.action;
  }
  if (employeeId) {
    const session = await UserSession.findOne({ employeeId })
      .sort({ createdAt: -1 })
      .select("action")
      .lean();
    if (session) return session.action;
  }
  return null;
};

const resolvePolicyVoilation = async ({ eventType, userId, employeeId, device, metadata, raw }) => {
  const parts = [
    eventType,
    metadata?.appName,
    metadata?.packageName,
    metadata?.app,
    metadata?.event,
    raw?.appName,
    raw?.packageName,
    raw?.app,
    raw?.event,
  ];
  const value = parts
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase())
    .join(" ");
  if (value.includes("accessibility")) return true;
  const policy = device?.devicePolicyState || {};
  const isBlocked = (flag) =>
    flag === true || flag === "true" || flag === 1 || flag === "1";
  if (value.includes("uninstall")) return isBlocked(policy.uninstallBlocked);
  if (value === "youtube" || value.includes("youtube")) return isBlocked(policy.youtubeBlocked);
  if (value === "whatsapp" || value.includes("whatsapp")) return isBlocked(policy.whatsappBlocked);
  if (value === "instagram" || value.includes("instagram")) return isBlocked(policy.instagramBlocked);
  if (value === "facebook" || value.includes("facebook")) return isBlocked(policy.facebookBlocked);
  if (!isCameraEvent(eventType)) return false;
  const status = await resolveUserSessionStatus({ userId, employeeId });
  return status === "Logged In";
};

const resolveBlockedAppViolation = (eventType, device) => {
  const value = String(eventType || "").trim().toLowerCase();
  const policy = device?.devicePolicyState || {};
  const isBlocked = (flag) =>
    flag === true || flag === "true" || flag === 1 || flag === "1";
  if (value.includes("youtube")) return isBlocked(policy.youtubeBlocked);
  if (value.includes("whatsapp")) return isBlocked(policy.whatsappBlocked);
  if (value.includes("instagram")) return isBlocked(policy.instagramBlocked);
  if (value.includes("facebook")) return isBlocked(policy.facebookBlocked);
  return null;
};

const resolveActorName = async ({ userId, employeeId, fallbackName }) => {
  if (employeeId) {
    const employee = await EmployeeModel.findOne({ employeeId }).lean();
    if (employee?.name) return employee.name;
    const visitor = await VisitorModel.findOne({ employeeId }).lean();
    if (visitor?.name) return visitor.name;
  }

  if (userId && mongoose.isValidObjectId(userId)) {
    const user = await UserModel.findById(userId).lean();
    if (user?.name) return user.name;
  }

  return fallbackName || "";
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

const sendAdminNotification = async (
  device,
  eventType,
  cameraStatus,
  name,
  employeeId,
  imagePath
) => {
  if (!device?.fcmToken) {
    return;
  }

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
  const message = {
    message: {
      token: device.fcmToken,
      notification: {
        title: "Camera Event Detected",
        body: `Event ${eventType} on ${name || device.ownerName || device.deviceId}`,
      },
      data: {
        event: eventType,
        cameraStatus: cameraStatus || "unknown",
        deviceId: String(device._id || ""),
        name: name || "",
        employee_id: employeeId || "",
        imagePath: imagePath || "",
      },
    },
  };

  const accessToken = await getAccessToken();
  await axios.post(url, message, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const resolveDeviceById = async (deviceId) => {
  if (!deviceId) return null;
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const deviceQuery = {
    $or: [{ deviceId: new RegExp(`^${normalizedDeviceId}$`, "i") }],
  };
  if (mongoose.isValidObjectId(deviceId)) {
    deviceQuery.$or.push({ _id: deviceId });
  }
  return DeviceModel.findOne(deviceQuery);
};

// Save device event (camera opened, etc.)
exports.storeEvent = async (req, res) => {
  try {
    const {
      deviceId,
      event,
      timestamp,
      cameraStatus,
      name,
      employeeId,
      employee_id,
      imagePath,
      codeId,
      metadata,
      narrative,
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({ status: false, message: "deviceId is required" });
    }
    if (!event) {
      return res.status(400).json({ status: false, message: "event is required" });
    }

    const device = await resolveDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const resolvedEmployeeId = employeeId || employee_id || device.employeeId || "";
    let policyVoilation = await resolvePolicyVoilation({
      eventType: event,
      userId: device.userId,
      employeeId: resolvedEmployeeId,
      device,
      metadata,
      raw: req.body,
    });
    const blockedViolation = resolveBlockedAppViolation(event, device);
    if (blockedViolation !== null) {
      policyVoilation = blockedViolation;
    }
    console.log("device-event policy check", {
      event,
      blockedViolation,
      policyState: device?.devicePolicyState || {},
      finalPolicyVoilation: policyVoilation,
    });

    const normalizedTimestamp = timestamp
      ? new Date(String(timestamp).replace(/(\.\d{3})\d+/, "$1"))
      : new Date();

    if (timestamp && isNaN(normalizedTimestamp.getTime())) {
      return res.status(400).json({ status: false, message: "timestamp is invalid" });
    }

    const savedEvent = await DeviceEvent.create({
      deviceId: device._id,
      event,
      cameraStatus,
      imagePath,
      name,
      employeeId: resolvedEmployeeId,
      codeId,
      policyVoilation,
      narrative,
      timestamp: normalizedTimestamp,
      metadata: {
        ...(metadata || {}),
        ...(narrative ? { narrative } : {}),
      },
      raw: req.body,
    });

    const actorName = await resolveActorName({
      userId: device.userId,
      employeeId: employeeId || employee_id || device.employeeId,
      fallbackName: name || device.ownerName,
    });

    const resolvedImagePath =
      imagePath || metadata?.imagePath || req.body?.imagePath || "";

    await ActivityModel.create({
      userId: device.userId,
      employeeId: resolvedEmployeeId,
      deviceId: String(device.deviceId || device._id || ""),
      category: resolveActivityCategory(event),
      activityType: event,
      title: "Device event",
      description:
        narrative || `Event ${event} reported by ${actorName || device.deviceId}`,
      name: actorName,
      imagePath: resolvedImagePath,
      occurredAt: normalizedTimestamp,
      policyVoilation,
      metadata: {
        cameraStatus,
        imagePath: resolvedImagePath,
        codeId,
        ...(narrative ? { narrative } : {}),
        ...metadata,
      },
      raw: req.body,
    });

    try {
      await sendAdminNotification(
        device,
        event,
        cameraStatus,
        name,
        employeeId || employee_id,
        imagePath
      );
    } catch (notifyError) {
      console.warn("⚠️ Device event notification failed:", notifyError.message);
    }

    return res.status(200).json({
      status: true,
      message: "Event saved successfully",
      data: savedEvent,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Latest screenshot event for a device
exports.getLatestScreenshot = async (req, res) => {
  try {
    const { deviceId } = req.query || {};
    if (!deviceId) {
      return res.status(400).json({ status: false, message: "deviceId is required" });
    }

    const device = await resolveDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ status: false, message: "Device not found" });
    }

    const event = await DeviceEvent.findOne({
      deviceId: device._id,
      imagePath: { $exists: true, $ne: "" },
      event: { $regex: "screenshot|camera", $options: "i" },
    })
      .sort({ timestamp: -1 })
      .lean();

    if (!event) {
      return res.status(200).json({ status: true, data: null });
    }

    return res.status(200).json({
      status: true,
      data: {
        timestamp: event.timestamp,
        imagePath: event.imagePath,
        deviceId: event.raw?.deviceId || device.deviceId || device._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
