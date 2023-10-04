const mongoose = require("mongoose");
const validator = require("validator");
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);



const userSchema = new mongoose.Schema(
  {
    // Full Name
    full_name: {
      type: String,
      trim: true,
      required: [true, 'Please Enter your Full Name'],
    },

    // Basic User Information
    email: {
      type: String,
      required: [true, 'Please Enter your email'],
      trim: true,
      unique: true,
      validate: [validator.isEmail, 'Please Enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please Enter your Phone Number'],
      unique: true,
      minLength: [10, 'Phone Number should be 10 Numbers'],
      maxLength: [10, 'Phone Number should be 10 Numbers'],
    },
    password: {
      type: String,
      required: [true, 'Please Enter the password'],
      trim: true,
      minLength: [6, 'Password should be at least 6 characters'],
      select: false, // To exclude the password field by default in query results
    },

    // Personal Information
    gender: {
      type: String,
      required: [true, 'Please Enter your Gender'],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, 'Please Enter your Date of Birth'],
    },
    current_weight: {
      type: Number,
      required: [true, 'Please Enter your current weight in Kg'],
    },
    goal_weight: {
      type: Number,
      required: [true, 'Please Enter your goal weight in Kg'],
    },
    intial_weight: {
      type: Number,
      required: [true, 'Please Enter your goal weight in '],
    },
    height: {
      type: Number,
      required: [true, 'Please Enter your height in cm'],
    },
    goal: {
      type: String,
      required: [true, 'Please Enter your fitness goal'],
    },
    profile_image_key: {
      type: String, // Store the image reference/key here
    },

    // Lifestyle and Physical Activity
    lifestyle: {
      type: [String], // Array of lifestyle choices (e.g., ["smoke", "vegan"])
    },
    physical_activity: {
      type: [String], // Array of physical activities (e.g., ["running", "yoga"])
    },

    //units
    weight_unit: {
      type: String,
      enum: ['lbs', 'kg'], // Add more options if needed
      required: [true, 'Please select weight unit preference'],
    },

    // Height Unit Preference (cm or ft)
    height_unit: {
      type: String,
      enum: ['cm', 'ft'], // Add more options if needed
      required: [true, 'Please select height unit preference'],
    },

    // Dietary Preferences and Health
    current_meal_type: {
      type: String, // Non-veg, veg, vegan, etc.
    },
    food_dislikes: {
      type: [String], // Array of disliked foods
    },
    food_allergies: {
      type: [String], // Array of food allergies
    },
    medical_history: {
      type: String, // User's medical history description
    },

    // Supplements and Eating Habits
    supplements_or_herbs: {
      type: String, // Details about supplements or herbs
    },
    skip_meals_frequency: {
      type: String, // Frequency of skipping meals or eating fast food
    },

    //Bmi
    bmi: {
      type: Number, // Store BMI here
    },


    // Work and Location
    occupation: {
      type: String,
    },
    office_timing: {
      type: String,
    },
    location: {
      type: String,
    },

    // Additional Fields as Needed
  },
  { timestamps: true }
);

userSchema.path("phone").validate(function validatePhone() {
  return this.phone > 999999999 && this.phone <= 9999999999;
});



// const User = mongoose.model("User", );
// const dietitian = mongoose.model("dietitian", dietitianSchema);

// module.exports = { User:userSchema};
module.exports = mongoose.model("User", userSchema);
// module.exports = mongoose.model("User", userSchema);
