const { ajModel } = require("../../common/classes/Model");

const userSchemaDefinition = {
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, trim: true, index: true },
  sessionStatus: {
    type: String,
    enum: ["Logged In", "Logout"],
    default: "Logout",
  },
  notificationsSeenAt: {
    type: Date,
    default: null,
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    default: null,
  },
  password: {
    type: String,
    select: false,
  },
  resetOtp: {
    type: String,
    select: false,
  },
  resetOtpExpiresAt: {
    type: Date,
  },
  resetOtpVerified: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: [
      "admin",
      "hr",
      "supervisor",
      "employee",
      "manager",
      "superadmin",
      "contractor",
      "visitor",
    ],
    default: "employee",
  },
  location: { type: String, trim: true, default: "" },
  profileImage: { type: String, trim: true, default: "" },
};

const userTransform = (ret) => ({
  id: ret._id,
  name: ret.name,
  fullname: ret.name,
  employeeId: ret.employeeId,
  sessionStatus: ret.sessionStatus,
  role: ret.role,
  location: ret.location,
  profileImage: ret.profileImage,
  createdAt: ret.createdAt,
  updatedAt: ret.updatedAt,
});

const UserWrapper = new ajModel(
  "User",
  userSchemaDefinition,
  userTransform
);

module.exports = UserWrapper.getModel();
