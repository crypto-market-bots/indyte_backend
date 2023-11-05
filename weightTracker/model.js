const mongoose = require("mongoose");

const WeightTracker = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    current_weight: {
      type: String,
      required: true,
    },
    goal_weight: {
      type: String,
      required: true,
    },
    proof_image: {
      type: String,
      required: true,
    },
    proof_image_key: {
      type: String,
      required: true,
    },
    status:{
      type: String,
      required: [true, "Please enter The proper type Type"],
      enum: ["pending", "approved", "rejected"],
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dietitian",
      required: false,
    },
  },
  { timestamps: true }
);

const PhysicalEquipment = mongoose.model("WeightTracker", WeightTracker);

module.exports = PhysicalEquipment;
