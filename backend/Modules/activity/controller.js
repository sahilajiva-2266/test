const ActivityModel = require("./model");
const DeviceEventModel = require("../device/deviceEventModel");
const DeviceModel = require("../device/model");
const paginate = require("../../helpers/limitoffset");
const mongoose = require("mongoose");
const UserModel = require("../user/model");
const VisitorModel = require("../user/visitorModel");
const UserSession = require("../user/userSessionsModel");

const resolveCategory = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("app_install")) return "app_install";
  if (value.includes("app_uninstall")) return "app_uninstall";
  if (value.includes("accessibility")) return "app_install";
  if (value.includes("youtube")) return "app_access";
  if (value.includes("whatsapp")) return "app_access";
  if (value.includes("instagram")) return "app_access";
  if (value.includes("facebook")) return "app_access";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  if (value.includes("camera")) return "camera";
  return "other";
};

const resolveActivityType = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("app_install")) return "app_install";
  if (value.includes("app_uninstall")) return "app_uninstall";
  if (value.includes("accessibility")) return "accessibility_permission";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("video")) return "video";
  if (value.includes("camera")) return "take_picture";
  return eventType;
};

const resolveMediaType = (eventType) => {
  const value = String(eventType || "").toLowerCase();
  if (value.includes("video")) return "video";
  if (value.includes("screenshot")) return "screenshot";
  if (value.includes("camera")) return "photo";
  return "file";
};

const isCameraActivity = (value) =>
  /camera|screenshot|video/i.test(String(value || ""));

const resolvePolicyVoilation = async (payload) => {
  const isCamera =
    isCameraActivity(payload.activityType) || isCameraActivity(payload.category);
  if (!isCamera) return false;
  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    const user = await UserModel.findById(payload.userId)
      .select("sessionStatus")
      .lean();
    if (user?.sessionStatus) return user.sessionStatus === "Logged In";
    const visitor = await VisitorModel.findById(payload.userId)
      .select("sessionStatus")
      .lean();
    if (visitor?.sessionStatus) return visitor.sessionStatus === "Logged In";
  }
  if (payload.employeeId) {
    const visitor = await VisitorModel.findOne({ employeeId: payload.employeeId })
      .select("sessionStatus")
      .lean();
    if (visitor?.sessionStatus) return visitor.sessionStatus === "Logged In";
  }
  const sessionQuery = {};
  if (payload.userId && mongoose.isValidObjectId(payload.userId)) {
    sessionQuery.userId = payload.userId;
  } else if (payload.employeeId) {
    sessionQuery.employeeId = payload.employeeId;
  } else {
    return false;
  }
  const session = await UserSession.findOne(sessionQuery)
    .sort({ createdAt: -1 })
    .select("action")
    .lean();
  return session?.action === "Logged In";
};

const buildActivityFilter = ({ userId, employeeId, deviceId, category, search }) => {
  const filter = { policyVoilation: true };
  if (employeeId) filter.employeeId = employeeId;
  if (deviceId) filter.deviceId = deviceId;

  if (category) {
    filter.category = String(category).toLowerCase();
  }

  if (userId) {
    if (mongoose.isValidObjectId(userId)) {
      filter["raw.userId"] = userId;
    } else {
      filter.$or = [{ name: userId }, { employeeId: userId }];
    }
  }

  if (search) {
    const regex = new RegExp(String(search), "i");
    filter.$or = [
      ...(filter.$or || []),
      { event: regex },
      { name: regex },
      { employeeId: regex },
      { deviceId: regex },
      { codeId: regex },
      { "metadata.description": regex },
      { "raw.deviceId": regex },
    ];
  }

  return filter;
};

exports.add = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.imagePath) {
      payload.imagePath =
        payload.metadata?.imagePath || payload.raw?.imagePath || "";
    }
    if (payload.policyVoilation === undefined) {
      payload.policyVoilation = await resolvePolicyVoilation(payload);
    }
    const record = await ActivityModel.create(payload);
    res.status(201).json({ status: true, message: "Activity logged", data: record });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// Summary counts for dashboard cards
exports.getSummary = async (_req, res) => {
  try {
    const cameraCount = await DeviceEventModel.countDocuments({
      policyVoilation: true,
      event: { $regex: "camera|screenshot|video", $options: "i" },
    });
    const installCount = await DeviceEventModel.countDocuments({
      policyVoilation: true,
      event: { $regex: "app[_-]?install|accessibility", $options: "i" },
    });
    const uninstallCount = await DeviceEventModel.countDocuments({
      policyVoilation: true,
      event: { $regex: "app[_-]?uninstall", $options: "i" },
    });
    const accessCount = await DeviceEventModel.countDocuments({
      policyVoilation: true,
      event: { $regex: "youtube|whatsapp|instagram|facebook", $options: "i" },
    });

    return res.status(200).json({
      status: true,
      data: {
        camera: cameraCount || 0,
        app_install: installCount || 0,
        app_uninstall: uninstallCount || 0,
        app_access: accessCount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { userId, employeeId, deviceId, category, search } = req.query;
    const filter = buildActivityFilter({
      userId,
      employeeId,
      deviceId,
      category,
      search,
    });

    const records = await DeviceEventModel.find(filter)
      .sort({ timestamp: -1, createdAt: -1 })
      .lean();

    const deviceIds = Array.from(
      new Set(
        records
          .map((doc) => doc?.deviceId)
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => String(id))
      )
    );
    const deviceIdCandidates = new Set();
    records.forEach((doc) => {
      const raw = doc?.raw || {};
      const metadata = doc?.metadata || {};
      const candidates = [
        raw?.deviceId,
        raw?.device_id,
        raw?.device?.deviceId,
        metadata?.deviceId,
        metadata?.device_id,
        metadata?.device?.deviceId,
        doc?.deviceId,
      ]
        .filter(Boolean)
        .map((value) => String(value));
      candidates.forEach((value) => {
        if (!mongoose.isValidObjectId(value)) {
          deviceIdCandidates.add(value);
        }
      });
    });

    const deviceMap = new Map();
    const deviceIdMap = new Map();
    if (deviceIds.length > 0) {
      const devices = await DeviceModel.find({ _id: { $in: deviceIds } })
        .select("deviceId")
        .lean();
      devices.forEach((device) => {
        deviceMap.set(String(device._id), device.deviceId || "");
        if (device.deviceId) {
          deviceIdMap.set(String(device.deviceId).toLowerCase(), device.deviceId);
        }
      });
    }
    if (deviceIdCandidates.size > 0) {
      const devices = await DeviceModel.find({
        deviceId: { $in: Array.from(deviceIdCandidates) },
      })
        .select("deviceId")
        .lean();
      devices.forEach((device) => {
        if (device.deviceId) {
          deviceIdMap.set(String(device.deviceId).toLowerCase(), device.deviceId);
        }
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const dataWithId = records.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const rawDeviceCandidate =
        plain.raw?.deviceId ||
        plain.raw?.device_id ||
        plain.raw?.device?.deviceId ||
        plain.raw?.device?.id ||
        plain.metadata?.deviceId ||
        plain.metadata?.device_id ||
        plain.metadata?.device?.deviceId ||
        plain.metadata?.device?.id ||
        "";
      const baseType = plain.event || plain.category || "";
      const activityTypeResolved = resolveActivityType(baseType);
      const categoryResolved = plain.category || resolveCategory(baseType);
      const media = Array.isArray(plain.media) ? plain.media : [];
      let resolvedDeviceId = "";
      if (rawDeviceCandidate) {
        if (mongoose.isValidObjectId(rawDeviceCandidate)) {
          resolvedDeviceId = deviceMap.get(String(rawDeviceCandidate)) || "";
        } else {
          resolvedDeviceId =
            deviceIdMap.get(String(rawDeviceCandidate).toLowerCase()) ||
            String(rawDeviceCandidate);
        }
      }
      if (!resolvedDeviceId && plain.deviceId) {
        if (
          typeof plain.deviceId === "string" &&
          !mongoose.isValidObjectId(plain.deviceId)
        ) {
          resolvedDeviceId =
            deviceIdMap.get(String(plain.deviceId).toLowerCase()) || plain.deviceId;
        } else if (mongoose.isValidObjectId(plain.deviceId)) {
          resolvedDeviceId = deviceMap.get(String(plain.deviceId)) || "";
        }
      }
      const mediaUrlCandidate =
        plain.imagePath ||
        media[0]?.url ||
        plain.metadata?.mediaUrl ||
        plain.metadata?.media ||
        plain.metadata?.imagePath ||
        plain.raw?.imagePath ||
        "";
      const mediaUrl =
        mediaUrlCandidate.startsWith("/uploads/")
          ? `${baseUrl}${mediaUrlCandidate}`
          : mediaUrlCandidate;
      const imagePath =
        plain.imagePath ||
        plain.metadata?.imagePath ||
        plain.raw?.imagePath ||
        "";
      return {
        id: plain._id?.toString?.() || plain.id,
        userName: plain.name || "",
        name: plain.name || "",
        activityType: activityTypeResolved,
        title: plain.title || activityTypeResolved,
        description:
          plain.metadata?.description || activityTypeResolved || "Activity detected",
        category: categoryResolved,
        deviceId: String(resolvedDeviceId || ""),
        employeeId: plain.employeeId || "",
        occurredAt: plain.timestamp || plain.createdAt,
        policyVoilation: !!plain.policyVoilation,
        imagePath,
        mediaUrl,
        media,
        metadata: {
          ...(plain.metadata || {}),
          mediaUrl,
          originalEvent: baseType,
        },
      };
    });
    const grouped = new Map();
    for (const item of dataWithId) {
      const userKey = item.userName || item.employeeId || item.deviceId || item.id;
      const existing = grouped.get(userKey);
      if (!existing) {
        grouped.set(userKey, {
          user: item.userName || "-",
          userKey,
          deviceId: item.deviceId || "",
          employeeId: item.employeeId || "",
          activities: [item],
        });
        continue;
      }
      existing.activities.push(item);
      if (!existing.deviceId && item.deviceId) {
        existing.deviceId = item.deviceId;
      }
      if (!existing.employeeId && item.employeeId) {
        existing.employeeId = item.employeeId;
      }
    }

    res.status(200).json(Array.from(grouped.values()));
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { page = 0, limit = 20, employeeId, deviceId, search } = req.query;
    const query = { policyVoilation: true };
    if (employeeId) query.employeeId = employeeId;
    if (deviceId) {
      const normalizedDeviceId = String(deviceId);
      const orFilters = [
        { "raw.deviceId": new RegExp(`^${normalizedDeviceId}$`, "i") },
        { "metadata.deviceId": new RegExp(`^${normalizedDeviceId}$`, "i") },
      ];
      if (mongoose.isValidObjectId(deviceId)) {
        orFilters.push({ deviceId });
      }
      query.$or = orFilters;
    }

    let searchQuery = { ...query };
    if (typeof search === "string" && search.trim().length > 0) {
      const regex = new RegExp(search, "i");
      searchQuery = {
        ...searchQuery,
        $or: [
          { name: regex },
          { employeeId: regex },
          { event: regex },
          { codeId: regex },
        ],
      };
    }

    const pageNum = parseInt(page, 10) || 0;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = pageNum * limitNum;

    const [data, totalrecords] = await Promise.all([
      DeviceEventModel.find(searchQuery)
        .sort({ timestamp: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      DeviceEventModel.countDocuments(searchQuery),
    ]);

    const deviceIds = Array.from(
      new Set(
        data
          .map((doc) => doc?.deviceId)
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => String(id))
      )
    );
    const deviceMap = new Map();
    if (deviceIds.length > 0) {
      const devices = await DeviceModel.find({ _id: { $in: deviceIds } })
        .select("deviceId")
        .lean();
      devices.forEach((device) => {
        deviceMap.set(String(device._id), device.deviceId || "");
      });
    }

    const mapped = (data || []).map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const rawDeviceId = plain.raw?.deviceId || plain.metadata?.deviceId || "";
      let resolvedDeviceId = "";
      if (rawDeviceId) {
        if (mongoose.isValidObjectId(rawDeviceId)) {
          resolvedDeviceId = deviceMap.get(String(rawDeviceId)) || "";
        } else {
          resolvedDeviceId = String(rawDeviceId);
        }
      } else if (
        typeof plain.deviceId === "string" &&
        !mongoose.isValidObjectId(plain.deviceId)
      ) {
        resolvedDeviceId = plain.deviceId;
      } else {
        resolvedDeviceId = deviceMap.get(String(plain.deviceId)) || "";
      }
      const description =
        plain.metadata?.description || plain.event || "Activity detected";

      return {
        id: plain._id?.toString?.() || plain.id,
        name: plain.name || "",
        employeeId: plain.employeeId || "",
        deviceId: resolvedDeviceId,
        activityType: plain.event || "",
        description,
        occurredAt: plain.timestamp || plain.createdAt,
        policyVoilation: true,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Notifications fetched",
      data: mapped,
      pagination: {
        totalrecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalrecords / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    const seenAt = req.user?.notificationsSeenAt || new Date(0);
    const count = await DeviceEventModel.countDocuments({
      policyVoilation: true,
      timestamp: { $gt: seenAt },
    });

    return res.status(200).json({ status: true, count });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const now = new Date();
    await UserModel.findByIdAndUpdate(req.user?._id, {
      notificationsSeenAt: now,
    });

    return res.status(200).json({
      status: true,
      message: "Notifications marked as read",
      seenAt: now,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined") {
      return res.status(400).json({ status: false, message: "Activity id is required" });
    }
    const record = await DeviceEventModel.findById(id);
    if (!record) return res.status(404).json({ status: false, message: "Not found" });
    res.status(200).json({ status: true, data: record });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.deleteMany = async (req, res) => {
  try {
    let ids = req.body.recordId || req.body.ids || req.params.id;
    if (!ids) return res.status(400).json({ status: false, message: "recordId required" });
    if (ids === "undefined") {
      return res.status(400).json({ status: false, message: "recordId required" });
    }
    if (typeof ids === "string") ids = [ids];
    const result = await DeviceEventModel.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ status: true, message: `${result.deletedCount} record(s) deleted` });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
