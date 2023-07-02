const mongoose = require("mongoose");

const waterAndFootTrackerSchema = new mongoose.Schema(
  {
    water_intake: {
      type: Number,
      required: [true, "Please Enter water Intake"],
    },
    foot_steps: {
      type: Number,
      required: [true, "Please Enter foot steps"],
    },
    completed_water_intake: {
      type: Number,
      default: 0,
    },
    completed_foot_steps: {
      type: Number,
      default: 0,
    },
    schedule_time: {
      type: Date
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const waterAndFootTrackerLogSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "waterAndFootTracker",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    water_intake: {
      type: Number,
      required: [true, "Please Enter water Intake"],
    },
    foot_steps: {
      type: Number,
      required: [true, "Please Enter foot steps"],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


const WaterAndFootTracker = mongoose.model(
  "waterAndFootTracker",
  waterAndFootTrackerSchema
);
const WaterAndFootTrackerLog = mongoose.model(
  "waterAndFootTrackerLog",
  waterAndFootTrackerLogSchema
);
module.exports = { WaterAndFootTracker, WaterAndFootTrackerLog };