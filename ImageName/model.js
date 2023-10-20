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
      required: true,
    },
    type: {
      type: String,
      enum:["goal","lifestyle","physicalActivities"],
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("ImageName", imageName);
