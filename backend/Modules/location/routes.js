const express = require("express");
const router = express.Router();
const Controller = require("./controller");
const verifyToken = require("../../middleware/verifyToken");
const checkAuthorization = require("../../middleware/checkAuthorization");

const allRoles = ["admin", "hr", "supervisor", "employee", "manager", "superadmin", "contractor"];

router.get("/coords",Controller.getCoords);
router.get("/", verifyToken, checkAuthorization(allRoles, "location"), Controller.getAll);
router.get("/:id", verifyToken, checkAuthorization(allRoles, "location"), Controller.getById);
router.post("/add", verifyToken, checkAuthorization(allRoles, "location"), Controller.add);
router.put("/:id", verifyToken, checkAuthorization(allRoles, "location"), Controller.update);
router.delete("/:id", verifyToken, checkAuthorization(allRoles, "location"), Controller.remove);

module.exports = router;
