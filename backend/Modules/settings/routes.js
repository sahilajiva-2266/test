const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");
const { upload } = require("../../middleware/upload");

const allRoles = ["admin", "hr", "supervisor", "employee", "manager", "superadmin", "contractor"];

router.get("/", verifyToken, checkAuthorization(allRoles, "settings"), Controller.get);
router.put(
  "/",
  verifyToken,
  checkAuthorization(allRoles, "settings"),
  upload.fields([
    { name: "apkFile", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ]),
  Controller.update
);

module.exports = router;
