const mongoose = require("mongoose");

const dietReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mealRecommdatioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserMealRecommendation",
    required: true,
  },
 
  reviewDate: {
    type: Date,
    default: Date.now,
  },
});

const DietReview = mongoose.model("DietReview", dietReviewSchema);

module.exports = DietReview;
