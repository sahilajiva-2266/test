const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Validator = require("../../helpers/validators");
const User = require("./model");
const EmployeeModel = require("../employees/model");
const { sendEmail } = require("../../helpers/sendemail");

/* ---------------------------------
   Helpers
---------------------------------- */
const JWT_SECRET =
  process.env.SECRET_KEY ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET;

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "30d",
  });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

const generateQrAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role, scope: "qr_access" },
    JWT_SECRET
  );

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ---------------------------------
   Register User
---------------------------------- */
exports.registerUser = async (req, res) => {
  const role = req.body.role || "employee";
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;
  const name = req.body.name?.trim();
  const employeeId = req.body.employeeId?.trim();

  const rules = {
    name: "required",
    email: "required|email",
    password: "required|min:6",
    employeeId: "required",
  };
  if (req.body.role) {
    rules.role =
      "in:admin,hr,supervisor,employee,manager,superadmin,contractor,visitor";
  }

  try {
    const validator = new Validator(
      {
        ...req.body,
        email,
        password,
        name,
        employeeId,
        role,
      },
      rules
    );
    await validator.validate();

    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Only one admin / superadmin
    if (role === "admin" || role === "superadmin") {
      const roleUser = await User.findOne({ role });
      if (roleUser) {
        return res.status(400).json({
          message: `A ${role} already exists`,
        });
      }
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      employeeId,
      role,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ---------------------------------
   Login User
---------------------------------- */
exports.loginUser = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const validator = new Validator(
      { email, password },
      { email: "required|email", password: "required" }
    );
    await validator.validate();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(user._id, {
      sessionStatus: "Logged In",
    });

    res.status(200).json({
      id: user._id,
      name: user.name,
      profileImage: user.profileImage || "",
      employeeId: user.employeeId || "",
      email: user.email || "",
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ---------------------------------
   QR Login User (no expiry, limited scope)
---------------------------------- */
exports.qrLoginUser = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const password = req.body.password;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const validator = new Validator(
      { email, password },
      { email: "required|email", password: "required" }
    );
    await validator.validate();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const allowedRoles = ["superadmin", "admin", "manager"];
    if (!allowedRoles.includes(String(user.role || "").toLowerCase())) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateQrAccessToken(user);
    let location = user.location || "";
    if (!location && user.employeeId) {
      const employee = await EmployeeModel.findOne({ employeeId: user.employeeId }).lean();
      location = employee?.location || "";
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      profileImage: user.profileImage || "",
      employeeId: user.employeeId || "",
      email: user.email || "",
      role: user.role,
      location,
      accessToken,
    });
  } catch (error) {
    console.error("QR Login Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ---------------------------------
   Forgot Password - Send OTP
---------------------------------- */
exports.forgotPassword = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();

  try {
    const validator = new Validator(
      { email },
      { email: "required|email" }
    );
    await validator.validate();

    const user = await User.findOne({ email }).select(
      "email name firstName lastName role"
    );
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Email not found",
      });
    }
    if (["employee", "contractor", "visitor"].includes(user.role)) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized",
      });
    }
    const resolvedName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || user.name?.trim();

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetOtp: otpHash,
          resetOtpExpiresAt: otpExpiresAt,
          resetOtpVerified: false,
        },
      }
    );

    await sendEmail("resetpassword.html", user.email, {
      OTP: otp,
      subject: "Password Reset OTP",
      USER_NAME: resolvedName || "User",
    });

    res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ---------------------------------
   Reset Password - Verify OTP
---------------------------------- */
exports.verifyResetOtp = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const otp = String(req.body.otp || "").trim();

  try {
    const validator = new Validator(
      { email, otp },
      { email: "required|email", otp: "required" }
    );
    await validator.validate();

    const user = await User.findOne({ email }).select("+resetOtp");
    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.resetOtpVerified = true;
    await user.save();

    res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const newPassword = req.body.newPassword;

  try {
    const validator = new Validator(
      { email, newPassword },
      { email: "required|email", newPassword: "required|min:6" }
    );
    await validator.validate();

    const user = await User.findOne({ email }).select("+password +resetOtp");
    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    if (user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (!user.resetOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    user.password = await hashPassword(newPassword);
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpVerified = false;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
