const SettingsModel = require("./model");
const DeviceModel = require("../device/model");

const toBool = (v, fallback) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    if (v.toLowerCase() === "true") return true;
    if (v.toLowerCase() === "false") return false;
  }
  if (typeof v === "number") return v === 1;
  return fallback;
};

const normalizeAppKey = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const compact = raw.replace(/[^a-z0-9]+/g, "");
  if (!compact) return "";
  const base = compact.replace(/blocked$/, "");
  return `${base}Blocked`;
};

const normalizeAppSettings = (input) => {
  if (input === undefined) return undefined;

  const source = typeof input === "string" ? JSON.parse(input) : input;
  if (!Array.isArray(source)) return [];

  const seen = new Set();
  const normalized = [];

  source.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const appName = String(item.appName || item.name || "").trim();
    const appUrl = String(item.appUrl || item.url || "").trim();
    const appKeyRaw = String(item.appKey || item.key || "").trim();
    const appKey = appKeyRaw || normalizeAppKey(appName || appUrl);
    if (!appKey) return;
    if (seen.has(appKey)) return;
    seen.add(appKey);
    normalized.push({
      appName,
      appUrl,
      appKey,
      active: toBool(item.active, false),
      block: toBool(item.block, false),
    });
  });

  return normalized;
};

const syncAppSettingsToDevices = async (appSettings = []) => {
  const activeSettings = appSettings.filter(
    (setting) => setting && setting.active && setting.appKey
  );
  if (!activeSettings.length) return;

  const operations = activeSettings.map((setting) => ({
    updateMany: {
      filter: {},
      update: {
        $set: { [`devicePolicyState.${setting.appKey}`]: !!setting.block },
      },
    },
  }));

  await DeviceModel.bulkWrite(operations, { ordered: false });
};

const normalizePayload = (body = {}) => {
  const deviceControls =
    typeof body.deviceControls === "string"
      ? JSON.parse(body.deviceControls)
      : body.deviceControls || {};
  const alerts =
    typeof body.alerts === "string"
      ? JSON.parse(body.alerts)
      : body.alerts || {};
  const qrExpirySeconds =
    Number.isFinite(Number(body.qrExpirySeconds)) && Number(body.qrExpirySeconds) > 0
      ? Number(body.qrExpirySeconds)
      : undefined;
  const otpEmail = body.otpEmail ? String(body.otpEmail).trim().toLowerCase() : undefined;
  const appSettings = normalizeAppSettings(
    body.appSettings !== undefined ? body.appSettings : deviceControls.appSettings
  );

  return {
    apiEndpointUrl: body.apiEndpointUrl,
    unitLocation: body.unitLocation,
    apkFileUrl: body.apkFileUrl,
    companyLogoUrl: body.companyLogoUrl,
    qrExpirySeconds,
    otpEmail,
    deviceControls: {
      cameraAccess: toBool(deviceControls.cameraAccess, true),
      allowAppUninstall: toBool(deviceControls.allowAppUninstall, false),
      locationAccess: toBool(deviceControls.locationAccess, true),
      allowScreenshots: toBool(deviceControls.allowScreenshots, false),
      blockUnknownApps: toBool(deviceControls.blockUnknownApps, true),
      autoSyncEnable: toBool(deviceControls.autoSyncEnable, true),
      whatsappCameraAccess: toBool(deviceControls.whatsappCameraAccess, false),
      facebookCameraAccess: toBool(deviceControls.facebookCameraAccess, false),
      ...(appSettings === undefined ? {} : { appSettings }),
    },
    alerts: {
      appInstallAlert: toBool(alerts.appInstallAlert, true),
      appUninstallAlert: toBool(alerts.appUninstallAlert, true),
      screenshotAlert: toBool(alerts.screenshotAlert, false),
      cameraActivityAlert: toBool(alerts.cameraActivityAlert, false),
    },
    metadata: body.metadata,
  };
};

exports.get = async (req, res) => {
  try {
    const unitLocation = req.query?.unitLocation;
    const filter = unitLocation ? { unitLocation } : {};
    const record = await SettingsModel.findOne(filter);
    res.status(200).json({ status: true, data: record || {} });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const unitLocation = payload.unitLocation || "";
    const apkFile = req.files?.apkFile?.[0];
    const companyLogo = req.files?.companyLogo?.[0];
    const deviceControlsRaw =
      typeof req.body.deviceControls === "string"
        ? JSON.parse(req.body.deviceControls)
        : req.body.deviceControls || {};
    const appSettingsProvided =
      req.body.appSettings !== undefined ||
      (deviceControlsRaw && deviceControlsRaw.appSettings !== undefined);

    if (apkFile) {
      payload.apkFileUrl = `/uploads/settings/${apkFile.filename}`;
    }
    if (companyLogo) {
      payload.companyLogoUrl = `/uploads/settings/${companyLogo.filename}`;
    }

    if (!appSettingsProvided) {
      const existing = await SettingsModel.findOne({ unitLocation }).lean();
      payload.deviceControls = {
        ...payload.deviceControls,
        appSettings: existing?.deviceControls?.appSettings || [],
      };
    }

    const record = await SettingsModel.findOneAndUpdate(
      { unitLocation },
      payload,
      {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      }
    );

    if (appSettingsProvided) {
      const appSettings =
        record?.deviceControls?.appSettings || record?.appSettings || [];
      await syncAppSettingsToDevices(appSettings);
    }

    res.status(200).json({ status: true, message: "Settings saved", data: record });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
