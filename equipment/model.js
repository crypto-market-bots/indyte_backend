const mongoose = require("mongoose");

const physicalEquipmentSchema = new mongoose.Schema(
  {
    equipment_name: {
      type: String,
      required: true,
    },
    equipment_image: {
      type: String,
      required: true,
    },
    equipment_image_key: {
      type: String,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dietitian",
      required: true,
    },
  },
  { timestamps: true }
);

const PhysicalEquipment = mongoose.model(
  "PhysicalEquipment",
  physicalEquipmentSchema
);

module.exports = PhysicalEquipment;
