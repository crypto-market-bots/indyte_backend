const mongoose = require("mongoose");

const waterAndFootTrackerSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      require: [true, "Enter the quantity number"],
    },
    type: {
      type: String,
      enum:["water", "foot"],
      required: [true, "Please Enter the type its footstep or Water"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_Date: {
     type :String
    },
  },
  { timestamps: true }
);

const WaterAndFootTracker = mongoose.model(
  "WaterAndFootTracker",
  waterAndFootTrackerSchema
);

module.exports = { WaterAndFootTracker };
