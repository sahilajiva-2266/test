const mongoose = require("mongoose");
const Validator = require("../../helpers/validators");
const EnquiryModel = require("./model");
const UserModel = require("../user/model");
const EmployeeModel = require("../employees/model");
const DeviceModel = require("../device/model");
const VisitorModel = require("../user/visitorModel");

exports.create = async (req, res) => {
  try {
    const { userId, employeeId, message } = req.body || {};

    const rules = {
      userId: "required|string",
      employeeId: "required|string",
      message: "required|string",
    };
    const validator = new Validator({ userId, employeeId, message }, rules);
    await validator.validate();

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ status: false, message: "userId must be valid" });
    }

    const enquiry = await EnquiryModel.create({
      userId,
      employeeId: String(employeeId).trim(),
      message: String(message).trim(),
    });

    return res.status(201).json({
      status: true,
      message: "Sent successfully",
      data: {
        _id: enquiry._id,
        userId: enquiry.userId,
        employeeId: enquiry.employeeId,
      },
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        status: false,
        message: error.message || "Validation failed",
        errors: error.errors,
      });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const enquiries = await EnquiryModel.find().sort({ createdAt: -1 }).lean();

    const userIds = Array.from(
      new Set(
        enquiries
          .map((item) => item.userId)
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => String(id))
      )
    );
    const employeeIds = Array.from(
      new Set(
        enquiries
          .map((item) => String(item.employeeId || "").trim())
          .filter((id) => id)
      )
    );

    const [users, employees, visitors, devices] = await Promise.all([
      userIds.length
        ? UserModel.find({ _id: { $in: userIds } })
            .select("name email employeeId")
            .lean()
        : [],
      employeeIds.length
        ? EmployeeModel.find({ employeeId: { $in: employeeIds } })
            .select("name email phone employeeId")
            .lean()
        : [],
      userIds.length || employeeIds.length
        ? VisitorModel.find({
            $or: [
              ...(userIds.length ? [{ _id: { $in: userIds } }] : []),
              ...(employeeIds.length ? [{ employeeId: { $in: employeeIds } }] : []),
            ],
          })
            .select("name email phone employeeId")
            .lean()
        : [],
      userIds.length
        ? DeviceModel.find({ userId: { $in: userIds } })
            .select("userId deviceId deviceStatus")
            .lean()
        : [],
    ]);

    const userMap = new Map();
    users.forEach((user) => {
      userMap.set(String(user._id), user);
    });
    const employeeMap = new Map();
    employees.forEach((employee) => {
      employeeMap.set(String(employee.employeeId), employee);
    });
    const visitorByIdMap = new Map();
    const visitorByEmployeeIdMap = new Map();
    visitors.forEach((visitor) => {
      if (visitor?._id) {
        visitorByIdMap.set(String(visitor._id), visitor);
      }
      if (visitor?.employeeId) {
        visitorByEmployeeIdMap.set(String(visitor.employeeId), visitor);
      }
    });
    const deviceMap = new Map();
    devices.forEach((device) => {
      const key = String(device.userId || "");
      if (!key) return;
      const next = device.deviceId || "";
      if (!next) return;
      const existing = deviceMap.get(key);
      if (!existing) {
        deviceMap.set(key, { deviceId: next, deviceStatus: device.deviceStatus });
        return;
      }
      if (existing.deviceStatus !== "Active" && device.deviceStatus === "Active") {
        deviceMap.set(key, { deviceId: next, deviceStatus: device.deviceStatus });
      }
    });

    const data = enquiries.map((item) => {
      const user = userMap.get(String(item.userId)) || {};
      const employee = employeeMap.get(String(item.employeeId || "").trim()) || {};
      const visitor =
        visitorByIdMap.get(String(item.userId)) ||
        visitorByEmployeeIdMap.get(String(item.employeeId || "").trim()) ||
        {};
      const device = deviceMap.get(String(item.userId)) || {};
      const name = employee.name || visitor.name || user.name || "";
      const email = employee.email || visitor.email || user.email || "";
      const phone = employee.phone || visitor.phone || "";
      const deviceId = device.deviceId || "";

      return {
        _id: item._id,
        userId: item.userId,
        employeeId: item.employeeId,
        deviceId,
        name,
        email,
        phone,
        message: item.message,
        createdAt: item.createdAt,
      };
    });

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
