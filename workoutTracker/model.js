const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
    physical_equipments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PhysicalEquipment", // Reference the PhysicalEquipment model
      },
    ],
    calorie_burn: {
      type: Number,
      required: true,
    },
    exercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dieitian", // Assuming 'User' is the model name for dietitians
      required: true,
    },
  },
  {
    timestamps: true, // Adds created_at and updated_at fields
  }
);



//4
//2 y,z
//2,1,2

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


//1,2,3,4
//2,4


// -> workout/ api -> excersise- > set_1, {set: {"1" : [execrise1,exe], "2", : [excersie2] }
const workoutRecommendation = mongoose.model('WorkOutRecommendation', workoutRecommendationSchema);
const Workout = mongoose.model('WorkOut', workoutSchema);
module.exports  = { Workout,workoutRecommendation}




