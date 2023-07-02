const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  burn_calories: {
    type: Number,
    required: true,
  },
  repetition: {
    type: Number,
    required: true,
  },
  steps: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  video_link: {
    type: String,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  set_number: {
    type: Number,
    default:1
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
});

const workoutSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    physical_equipments : { // {"Barbell": {image_link: "s3://"}}
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    exercises: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Exercise',
        }
    ],
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

const workoutRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOut',
    required: true,
  },

  difficulty: {
    type: String,
    required: true,
  },

  schedule_time: {
    type: Date,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },

  is_completed : {
    type: Boolean,
    default: false
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});



// -> workout/ api -> excersise- > set_1, {set: {"1" : [execrise1,exe], "2", : [excersie2] }
module.exports = mongoose.model('WorkOutRecommendation', workoutRecommendationSchema);

module.exports = mongoose.model('WorkOut', workoutSchema);

module.exports = mongoose.model('Exercise', exerciseSchema);



