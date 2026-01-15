const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

const allRoles = ["admin", "hr", "supervisor", "employee", "manager", "superadmin", "contractor"];

router.post(
  "/",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.add
);

// Alias for /attendance/add
router.post(
  "/add",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.add
);

router.get(
  "/",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.getAll
);

router.get(
  "/all",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.getAll
);

router.get(
  "/search",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.getAll
);

router.get(
  "/:id",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.getbyid
);

router.put(
  "/:id",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.update
);

router.delete(
  "/:id",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.delete
);

router.post(
  "/delete",
  verifyToken,
  checkAuthorization(allRoles, "attendance"),
  Controller.delete
);

module.exports = router;
