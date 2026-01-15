const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const EmployeeModel = require("./model");
const UserModel = require("../user/model");
const paginate = require("../../helpers/limitoffset");
const Validator = require("../../helpers/validators");
const { UPLOAD_ROOT } = require("../../middleware/upload");

const getDotValue = (data, key) => {
  if (!data) return undefined;
  if (Object.prototype.hasOwnProperty.call(data, key)) return data[key];
  return key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), data);
};

const normalizePayload = (data) => {
  const toDate = (v) => (v ? new Date(v) : v);
  const nameInput = data.name || data.fullName || data.full_name || "";
  let firstName = data.firstName || data.first_name || "";
  let lastName = data.lastName || data.last_name || "";

  if ((!firstName || !lastName) && nameInput) {
    const parts = String(nameInput)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!firstName && parts.length) {
      firstName = parts[0];
    }
    if (!lastName) {
      lastName = parts.slice(1).join(" ").trim() || parts[0] || "";
    }
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const name = nameInput || fullName;

  return {
    ...data,
    ...(name ? { name } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    profileImage: data.profileImage || data.profile_image || "",
    currentAddress: {
      street:
        data.currentAddress?.street ||
        getDotValue(data, "currentAddress.street") ||
        data.currentStreet ||
        data.current_address_street ||
        data.currentaddress,
      city:
        data.currentAddress?.city ||
        getDotValue(data, "currentAddress.city") ||
        data.currentCity ||
        data.current_address_city ||
        data.city,
      state:
        data.currentAddress?.state ||
        getDotValue(data, "currentAddress.state") ||
        data.currentState ||
        data.current_address_state ||
        data.state,
      pincode:
        data.currentAddress?.pincode ||
        getDotValue(data, "currentAddress.pincode") ||
        data.currentPincode ||
        data.current_address_pincode ||
        data.pincode,
    },
    permanentAddress: {
      street:
        data.permanentAddress?.street ||
        getDotValue(data, "permanentAddress.street") ||
        data.permanentStreet ||
        data.permanent_address_street ||
        data.permanentaddress,
      city:
        data.permanentAddress?.city ||
        getDotValue(data, "permanentAddress.city") ||
        data.permanentCity ||
        data.permanent_address_city ||
        data.permanentCity ||
        data.city,
      state:
        data.permanentAddress?.state ||
        getDotValue(data, "permanentAddress.state") ||
        data.permanentState ||
        data.permanent_address_state ||
        data.permanentState ||
        data.state,
      pincode:
        data.permanentAddress?.pincode ||
        getDotValue(data, "permanentAddress.pincode") ||
        data.permanentPincode ||
        data.permanent_address_pincode ||
        data.permanentPincode ||
        data.pincode,
    },
    joiningDate: toDate(data.joiningDate || data.joining_date),
    dob: toDate(data.dob || data.date_of_birth),
    employmentType: data.employmentType || data.employment_type || "Full-time",
    status: data.status || "Active",
    role: data.role || "employee",
    location: data.location || data.locationName || "",
    bankDetails: {
      aadharcardnumber:
        data.bankDetails?.aadharcardnumber ||
        getDotValue(data, "bankDetails.aadharcardnumber") ||
        data.aadharcardnumber,
      pancard:
        data.bankDetails?.pancard ||
        getDotValue(data, "bankDetails.pancard") ||
        data.pancard,
      accountNumber:
        data.bankDetails?.accountNumber ||
        getDotValue(data, "bankDetails.accountNumber") ||
        data.accountNumber,
      ifscCode:
        data.bankDetails?.ifscCode ||
        getDotValue(data, "bankDetails.ifscCode") ||
        data.ifscCode,
      bankName:
        data.bankDetails?.bankName ||
        getDotValue(data, "bankDetails.bankName") ||
        data.bankName,
      branch:
        data.bankDetails?.branch ||
        getDotValue(data, "bankDetails.branch") ||
        data.branch,
    },
    emergencyContact: {
      name:
        data.emergencyContact?.name ||
        getDotValue(data, "emergencyContact.name") ||
        data.emergencyName ||
        data.emergency_contact_name ||
        data.emergency_contact,
      relation:
        data.emergencyContact?.relation ||
        getDotValue(data, "emergencyContact.relation") ||
        data.emergencyRelation ||
        data.emergency_contact_relation ||
        data.emergency_relation,
      phone:
        data.emergencyContact?.phone ||
        getDotValue(data, "emergencyContact.phone") ||
        data.emergencyPhone ||
        data.emergency_contact_phone,
    },
    systemAccess: {
      emailVerified: !!data.emailVerified,
      phoneVerified: !!data.phoneVerified,
      loginEnabled: data.loginEnabled !== false,
      lastLogin: toDate(data.lastLogin),
    },
  };
};

const validateEmployeeData = async (data) => {
  const rules = {
    firstName: "required|string",
    lastName: "required|string",
    gender: "required|string",
    dob: "required|date",
    email: "required|email",
    phone: "required|string",

    "currentAddress.street": "required|string",
    "currentAddress.city": "required|string",
    "currentAddress.state": "required|string",
    "currentAddress.pincode": "required|string",

    "permanentAddress.street": "required|string",
    "permanentAddress.city": "required|string",
    "permanentAddress.state": "required|string",
    "permanentAddress.pincode": "required|string",

    employeeId: "required|string",
    joiningDate: "required|date",
    designation: "required|string",
    department: "required|string",
    section: "required|string",
    shift: "required|string",
    employmentType: "required|string",
    role: "required|string",
    status: "required|string",

    "bankDetails.aadharcardnumber": "required|string",
    "bankDetails.pancard": "required|string",
    "bankDetails.accountNumber": "required|string",
    "bankDetails.ifscCode": "required|string",

  };
  const validator = new Validator(data, rules);
  await validator.validate();
};

exports.add = async (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    const creatorRole = String(req.user?.role || "").toLowerCase();
    if (["hr", "manager"].includes(creatorRole)) {
      const allowedRoles = ["employee", "contractor", "supervisor"];
      if (!allowedRoles.includes(String(normalized.role || "").toLowerCase())) {
        return res.status(403).json({
          status: false,
          message: "You can only assign employee, contractor, or supervisor roles.",
        });
      }
    }
    if (req.file) {
      normalized.profileImage = `/uploads/employees/${req.file.filename}`;
    }
    await validateEmployeeData(normalized);

    const existing = await EmployeeModel.findOne({ email: normalized.email });
    if (existing) {
      return res
        .status(400)
        .json({ status: false, message: "Employee already exists with this email" });
    }

    // Ensure a corresponding user record exists with required fields
    let user = await UserModel.findOne({
      $or: [{ email: normalized.email }, { employeeId: normalized.employeeId }],
    });
    if (!user) {
      user = await UserModel.create({
        name: normalized.name,
        firstName: normalized.firstName,
        lastName: normalized.lastName,
        employeeId: normalized.employeeId,
        email: normalized.email,
        password: null,
        role: normalized.role || "employee",
        location: normalized.location || "",
        profileImage: normalized.profileImage || "",
      });
    } else if (normalized.profileImage) {
      await UserModel.findByIdAndUpdate(user._id, {
        profileImage: normalized.profileImage,
      });
    }

    // Do not store password; keep null for employee/user created via this flow
    const data = { ...normalized, password: null, userId: user._id };

    const employee = await EmployeeModel.create(data);

    return res.status(201).json({
      status: true,
      message: "Employee created successfully",
      data: employee,
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
    const { page, limit, search, status, department, attendanceStatus } = req.query;
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);
    const filter = {};
    if (status) filter["status"] = status;
    if (department) filter["department"] = department;
    if (attendanceStatus) filter["attendanceStatus"] = attendanceStatus;

    const result = await paginate(
      EmployeeModel,
      filter,
      pageNumber,
      limit,
      [],
      ["firstName", "lastName", "email", "rfid", "designation", "employeeId", "department"],
      search
    );

    // Normalize payload for UI (add id and name)
    const employees = result.data.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      const fullName = `${plain.firstName || ""} ${plain.lastName || ""}`.trim();
      return {
        ...plain,
        id: plain._id?.toString?.() || plain.id,
        name: plain.name || fullName,
      };
    });

    return res.status(200).json({
      status: result.status,
      message: result.message,
      employees,
      total: result.pagination?.totalrecords || 0,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getIndexes = async (_req, res) => {
  try {
    const indexes = await EmployeeModel.collection.listIndexes().toArray();
    return res.status(200).json({
      status: true,
      message: "Indexes fetched",
      indexes: indexes.map((idx) => ({
        name: idx.name,
        key: idx.key,
        unique: !!idx.unique,
      })),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.cleanupIndexes = async (_req, res) => {
  try {
    const collection = EmployeeModel.collection;
    const indexes = await collection.listIndexes().toArray();
    const legacy = indexes.filter((idx) => {
      if (!idx?.key) return false;
      return Object.keys(idx.key).some(
        (key) => key.startsWith("professional.") || key.startsWith("personal.")
      );
    });
    const dropped = [];
    for (const idx of legacy) {
      await collection.dropIndex(idx.name);
      dropped.push(idx.name);
    }
    return res.status(200).json({
      status: true,
      message: "Legacy indexes cleaned",
      dropped,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getbyid = async (req, res) => {
  try {
    const param = req.params.id;
    const employee = await EmployeeModel.findOne({
      $or: [{ _id: param }, { rfid: param }],
    });
    if (!employee) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    return res.status(200).json({ employee });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const normalized = normalizePayload(req.body);
    const updates = { ...normalized };
    const previous = req.file
      ? await EmployeeModel.findById(req.params.id).select("profileImage")
      : null;
    if (!req.file && !req.body.profileImage && !req.body.profile_image) {
      delete updates.profileImage;
    }
    if (req.file) {
      updates.profileImage = `/uploads/employees/${req.file.filename}`;
    }

    // Do not process password updates in this flow
    delete updates.password;

    const updated = await EmployeeModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: false,
    });
    if (!updated) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    if (updated.userId) {
      const userUpdates = {
        location: updated.location || "",
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        name: updated.name || `${updated.firstName || ""} ${updated.lastName || ""}`.trim(),
        email: updated.email || "",
        role: updated.role || "employee",
        employeeId: updated.employeeId || "",
      };
      if (updates.profileImage) {
        userUpdates.profileImage = updates.profileImage;
      }
      await UserModel.findByIdAndUpdate(updated.userId, userUpdates);
    }
    if (req.file && previous?.profileImage) {
      const oldPath = previous.profileImage;
      if (oldPath.startsWith("/uploads/")) {
        const absolutePath = path.join(UPLOAD_ROOT, oldPath.replace("/uploads/", ""));
        try {
          await fs.promises.unlink(absolutePath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.warn("Failed to delete image:", absolutePath, err.message);
          }
        }
      }
    }
    return res.status(200).json({
      status: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { users, status } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ status: false, message: "Users missing" });
    }
    const result = await EmployeeModel.updateMany(
      { _id: { $in: users } },
      { $set: { status } }
    );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No users found with the provided IDs" });
    }
    return res.status(200).json({
      status: true,
      message: "Status updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    let recordIds = req.body?.recordId || req.params?.id;
    if (!recordIds) {
      return res
        .status(404)
        .json({ status: false, message: "Record ID(s) not found" });
    }
    if (typeof recordIds === "string") recordIds = [recordIds];
    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Record ID(s) must be a non-empty string or array",
      });
    }

    const employees = await EmployeeModel.find({ _id: { $in: recordIds } }).select(
      "_id userId employeeId profileImage"
    );
    const userIds = employees
      .map((employee) => employee.userId)
      .filter(Boolean);
    const employeeIds = employees
      .map((employee) => employee.employeeId)
      .filter(Boolean);
    const imagePaths = employees
      .map((employee) => employee.profileImage)
      .filter(Boolean);

    const result = await EmployeeModel.deleteMany({ _id: { $in: recordIds } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No matching records found" });
    }

    if (userIds.length > 0 || employeeIds.length > 0) {
      await UserModel.deleteMany({
        $or: [
          ...(userIds.length ? [{ _id: { $in: userIds } }] : []),
          ...(employeeIds.length ? [{ employeeId: { $in: employeeIds } }] : []),
        ],
      });
    }

    if (imagePaths.length > 0) {
      await Promise.all(
        imagePaths.map(async (imagePath) => {
          if (!imagePath.startsWith("/uploads/")) return;
          const absolutePath = path.join(UPLOAD_ROOT, imagePath.replace("/uploads/", ""));
          try {
            await fs.promises.unlink(absolutePath);
          } catch (err) {
            if (err.code !== "ENOENT") {
              console.warn("Failed to delete image:", absolutePath, err.message);
            }
          }
        })
      );
    }

    return res.status(200).json({
      status: true,
      message: `${result.deletedCount} record(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
