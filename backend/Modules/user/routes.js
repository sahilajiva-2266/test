const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  qrLoginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("./controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/qr-login", qrLoginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
