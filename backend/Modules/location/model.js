const { ajModel, mongoose } = require("../../common/classes/Model");

const locationSchemaDefinition = {
  name: { type: String, required: true, trim: true, unique: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  radius: { type: Number, required: true, min: 0 },
  raw: { type: mongoose.Schema.Types.Mixed, default: {} },
};

const locationModel = new ajModel("Location", locationSchemaDefinition);

module.exports = locationModel.getModel();
