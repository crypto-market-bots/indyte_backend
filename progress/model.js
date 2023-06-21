const mongoose = require("mongoose");

const progresSchema = new mongoose.Schema(
  {
    images: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Please Give me the Some Images"],
    },
    physical_measurement: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Please Give me the Some Physical Measurements"],
    },
    progress_month_year: {
      type: Date,
      required: [true, "Please Enter the Month and Year"],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progresSchema);
