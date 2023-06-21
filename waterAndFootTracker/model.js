const mongoose = require("mongoose");
const waterAndFootTracker = new mongoose.Schema(
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
    create_time: {
      type: Date,
      default: Date.now,
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


