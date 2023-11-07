const mongoose = require("mongoose");

const WeightTrackerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    isCompleted: {
      type: Boolean,
      required: true,
      default:false
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

const WeightTracker = mongoose.model("WeightTracker", WeightTrackerSchema);

module.exports = {WeightTracker};
