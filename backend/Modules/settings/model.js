const { ajModel, mongoose } = require("../../common/classes/Model");

/* ---------------------------------
   Schema Definition
---------------------------------- */
const settingsSchemaDefinition = {
  apiEndpointUrl: {
    type: String,
    trim: true,
    default: "",
  },

  unitLocation: {
    type: String,
    trim: true,
    default: "",
  },

  apkFileUrl: {
    type: String,
    trim: true,
    default: "",
  },

  companyLogoUrl: {
    type: String,
    trim: true,
    default: "",
  },

  qrExpirySeconds: {
    type: Number,
    default: 60,
  },

  otpEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
  },

  deviceControls: {
    cameraAccess: { type: Boolean, default: true },
    allowAppUninstall: { type: Boolean, default: false },
    locationAccess: { type: Boolean, default: true },
    allowScreenshots: { type: Boolean, default: false },
    blockUnknownApps: { type: Boolean, default: true },
    autoSyncEnable: { type: Boolean, default: true },

    // social media camera rules
    whatsappCameraAccess: { type: Boolean, default: false },
    facebookCameraAccess: { type: Boolean, default: false },

    appSettings: {
      type: [
        {
          appName: { type: String, trim: true, default: "" },
          appUrl: { type: String, trim: true, default: "" },
          appKey: { type: String, trim: true, default: "" },
          active: { type: Boolean, default: false },
          block: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },

  alerts: {
    appInstallAlert: { type: Boolean, default: true },
    appUninstallAlert: { type: Boolean, default: true },
    screenshotAlert: { type: Boolean, default: false },
    cameraActivityAlert: { type: Boolean, default: false },
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
};

/* ---------------------------------
   Transform Function (User-style)
---------------------------------- */
const settingsTransform = (ret) => {
  return {
    id: ret._id,

    apiEndpointUrl: ret.apiEndpointUrl,
    unitLocation: ret.unitLocation,
    apkFileUrl: ret.apkFileUrl,
    companyLogoUrl: ret.companyLogoUrl,
    qrExpirySeconds: ret.qrExpirySeconds,
    otpEmail: ret.otpEmail,

    deviceControls: ret.deviceControls,
    alerts: ret.alerts,
    metadata: ret.metadata,

    createdAt: ret.createdAt,
    updatedAt: ret.updatedAt,
  };
};

/* ---------------------------------
   Model Export
---------------------------------- */
const SettingsModel = new ajModel(
  "SystemSettings",
  settingsSchemaDefinition,
  settingsTransform
).getModel();

module.exports = SettingsModel;
