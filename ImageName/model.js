const mongoose = require("mongoose");
const imageName = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    image_key: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
      enum: ["goal", "lifestyle", "physicalActivities", "banner"],
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("ImageName", imageName);
