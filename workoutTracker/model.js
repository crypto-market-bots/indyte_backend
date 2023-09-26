const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    workout_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    workout_image: {
      type: String,
      required: true,
    },
    workout_image_key: {
      type: String,
      required: true,
    },
    physical_equipments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PhysicalEquipment",
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
      ref: "dieitian", 
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dieitian", 
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
  date: {
    type: Date,
    required: [true, "Please Specify Date You want to assign"],
  },
  workout_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOut',
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["BEGINNER", "INTERMEDIATE", "HARD",],
    required: true,
  },
  user_picked: {
    type: Boolean,
    default: false,
  },
  user_skip: {
    type: Boolean,
    default: false,
  },
  assigned_by: {
    // dietition
    type: mongoose.Schema.Types.ObjectId,
    ref: "dietitian",
    required: true,
  },
  
},{timestamps:true});


//1,2,3,4
//2,4


// -> workout/ api -> excersise- > set_1, {set: {"1" : [execrise1,exe], "2", : [excersie2] }
const workoutRecommendation = mongoose.model('WorkOutRecommendation', workoutRecommendationSchema);
const Workout = mongoose.model('WorkOut', workoutSchema);
module.exports  = { Workout,workoutRecommendation}




