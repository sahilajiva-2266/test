const mongoose = require("mongoose");
const AttendanceModel = require("./model");
const paginate = require("../../helpers/limitoffset");
const Validator = require("../../helpers/validators");

const validateAttendanceData = async (data) => {
  const rules = {
    rfidCardId: "required|string",
    date: "required|date"
  };
  const validator = new Validator(data, rules);
  await validator.validate();
};

exports.add = async (req, res) => {
  try {
    await validateAttendanceData(req.body);
    const attendance = await AttendanceModel.create(req.body);
    return res.status(201).json({
      status: true,
      message: "Attendance created successfully",
      data: attendance,
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
    const {
      sectionAssigned,
      status,
      page,
      limit,
      search,
      date,
    } = req.query;
    // normalize to zero-based page
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);
    const filter = {};
    if (sectionAssigned) filter.sectionAssigned = sectionAssigned;
    if (date) filter.date = date;
    if (status === "approved") {
      filter.hrApproved = true;
      filter.supervisorApproved = true;
    }

    const result = await paginate(
      AttendanceModel,
      filter,
      pageNumber,
      limit,
      [],
      ["sectionAssigned", "remarks", "rfidCardId"],
      search
    );
    // Frontend expects an array response; add id alias for convenience
    const dataWithId = result.data.map((doc) => {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      return { ...plain, id: plain._id?.toString?.() || plain.id };
    });
    return res.status(200).json(dataWithId);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getbyid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Attendance id is required" });
    }

    const query = mongoose.isValidObjectId(id)
      ? { _id: id }
      : { rfidCardId: id };

    const attendance = await AttendanceModel.findOne(query);
    if (!attendance) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Record fetched",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Attendance id is required" });
    }
    const updated = await AttendanceModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ status: false, message: "Not found" });
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

exports.delete = async (req, res) => {
  try {
    let recordIds = req.body?.recordId || req.params?.id;
    if (!recordIds) {
      return res
        .status(404)
        .json({ status: false, message: "Record ID(s) not found" });
    }
    if (recordIds === "undefined") {
      return res
        .status(400)
        .json({ status: false, message: "Record ID(s) not found" });
    }
    if (typeof recordIds === "string") recordIds = [recordIds];
    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Record ID(s) must be a non-empty string or array",
      });
    }

    const result = await AttendanceModel.deleteMany({ _id: { $in: recordIds } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No matching records found" });
    }

    return res.status(200).json({
      status: true,
      message: `${result.deletedCount} record(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
