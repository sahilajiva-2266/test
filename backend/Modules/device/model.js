const { ajModel, mongoose } = require("../../common/classes/Model");

const deviceSchemaDefinition = {
  // Align ref name with the User model used elsewhere
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  employeeId: { type: String, trim: true, index: true },
  deviceId: { type: String, trim: true, index: true },
  deviceName: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  deviceStatus: {
    type: String,
    enum: ["Active", "Disable"],
    default: "Disable",
  },
  type: {
    type: String,
    enum: ["MOBILE", "WEB", "TABLET", "DESKTOP", "OTHER"],
    default: "MOBILE",
  },
  platform: { type: String, trim: true },
  model: { type: String, trim: true },
  browser: { type: String, trim: true },
  osVersion: { type: String, trim: true },
  appVersion: { type: String, trim: true },
  fcmToken: { type: String, trim: true },
  ownerName: { type: String, trim: true },
  isDeviceOwner: { type: Boolean, default: false },
  deviceInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
  devicePolicyState: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      cameraDisabled: false,
      uninstallBlocked: false,
      facebookBlocked: false,
      instagramBlocked: false,
      youtubeBlocked: false,
      whatsappBlocked: false,
      kioskMode: false,
      allowedApps: [],
      blockedApps: [],
    },
  },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", default: null },
  status: {
    type: String,
    enum: ["ONLINE", "OFFLINE", "BLOCKED"],
    default: "OFFLINE",
  },
  verified: { type: Boolean, default: false },
  registerToken: { type: String, trim: true, index: true, default: null },
  lastOnline: { type: Date, default: null },
  enrollmentDate: { type: Date, default: null },
  lastSeen: { type: Date, default: null },
  deviceOwner: { type: String, trim: true },
  locationAllowed: { type: Boolean, default: true },
  lastScreenshotAt: { type: Date, default: null },
  loginToken: { type: String, trim: true, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  raw: { type: mongoose.Schema.Types.Mixed, default: {} },
  deviceLocation: { type: mongoose.Schema.Types.Mixed, default: null },
};

const deviceModel = new ajModel("Device", deviceSchemaDefinition);
deviceModel.schema.index({ userId: 1, type: 1 });

module.exports = deviceModel.getModel();
