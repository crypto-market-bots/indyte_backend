const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nutritions: { // {"fat": {type: , value: }, ""}
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  required_ingredients: { // {"water": {value: 4, type : cup}}
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  steps: {  // {"1": "abcdefghijklmnop", "2":"abcdefghijklmnop" .....}
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
});

const userMealRecommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true,
    },
    meal_time: {
        type: Date,
        required: true,
    },
    meal_period: {
        type: String,
        enum: ['lunch', 'breakfast', 'dinner'],
        required: true,
    },
    user_picked: {
        type: Boolean,
        default:false,
    },
    added_by: { // dietition 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    created_time: {
        type: Date,
        default: Date.now,
    },
});

const UserMealRecommendation = mongoose.model('UserMealRecommendation', userMealRecommendationSchema);
const Meal = mongoose.model('Meal', mealSchema);

module.exports = {Meal, UserMealRecommendation};
// module.exports = UserMealRecommendation;
