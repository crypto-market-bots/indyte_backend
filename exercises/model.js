const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  difficulty_level: {
    type: String, // 'Easy', 'Medium', 'Hard'
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ytlink1: {
    type: String,
    required: true,
  },
  calorie_burn: {
    type: Number,
    required: true,
  },
  repetition: {
    type: Number,
    required: true,
  },
  exercise_image: {
    type: String,
    required: true,
  },
  exercise_image_key: {
    type: String,
    required: true,
  },
  steps: {
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
      },
    ],
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "dietitian",
    required: true,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = {Exercise};
