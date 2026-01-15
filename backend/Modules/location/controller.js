const mongoose = require("mongoose");
const paginate = require("../../helpers/limitoffset");
const LocationModel = require("./model");

const validatePayload = ({ name, lat, lng, radius }) => {
  if (!name) throw new Error("Location name is required");
  if (lat === undefined || lat === null) throw new Error("Latitude is required");
  if (lng === undefined || lng === null) throw new Error("Longitude is required");
  if (radius === undefined || radius === null) throw new Error("Radius is required");
};

const normalizeNumber = (value) => (value === undefined ? value : Number(value));

const normalizePayload = (body) => ({
  name: body.name?.trim(),
  lat: normalizeNumber(body.lat),
  lng: normalizeNumber(body.lng ?? body.long),
  radius: normalizeNumber(body.radius),
  raw: body,
});

const format = (doc) => {
  const d = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return { ...d, id: d._id?.toString?.() || d.id };
};

exports.add = async (req, res) => {
  try {
    const data = normalizePayload(req.body);
    validatePayload(data);

    const exists = await LocationModel.findOne({ name: data.name });
    if (exists) {
      return res.status(400).json({ status: false, message: "Location name already exists" });
    }

    const loc = await LocationModel.create(data);
    return res.status(201).json({ status: true, message: "Location created", data: format(loc) });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const pageNumber = Math.max(0, (parseInt(page, 10) || 1) - 1);

    const result = await paginate(
      LocationModel,
      {},
      pageNumber,
      limit,
      [],
      ["name"],
      search
    );

    const locations = result.data.map(format);

    return res.status(200).json({
      status: result.status,
      message: result.message,
      locations,
      total: result.pagination?.totalrecords || 0,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server Error", error: error.message });
  }
};

exports.getCoords = async (_req, res) => {
  try {
    const locations = await LocationModel.find({})
      .select("name lat lng radius")
      .lean();
    return res.status(200).json({
      status: true,
      data: locations.map((loc) => ({
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        radius: loc.radius,
      })),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { name: id };
    const loc = await LocationModel.findOne(query);
    if (!loc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({ status: true, message: "Record fetched", data: format(loc) });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = normalizePayload(req.body);
    validatePayload(data);

    const loc = await LocationModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!loc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({ status: true, message: "Location updated", data: format(loc) });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const loc = await LocationModel.findByIdAndDelete(id);
    if (!loc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }
    return res.status(200).json({ status: true, message: "Location deleted" });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};
