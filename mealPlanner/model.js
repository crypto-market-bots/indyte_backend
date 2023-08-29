const mongoose = require('mongoose');



const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nutritions: {
    type: [
      {
        type: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
      },
    ],
    _id: false,
  },

  required_ingredients: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    _id: false, // Exclude the _id field from required_ingredients subdocuments
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
    _id: false, // Exclude the _id field from steps subdocuments
  },
  description: {
    type: String,
    required: true,
  },
  ytlink1: {
    type: String,
  },
  meal_image: {
    type: String,
    required: true,
  },
  meal_image_key: {
    type: String,
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
        enum: ['LUNCH', 'BREAKFAST', 'DINNER'],
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
