const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    trim: true,
    required: [true, "Please Enter your First Name"],
  },
  last_name: {
    type: String,
    trim: true,
    required: [true, "Please Enter your Last Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter your email"],
    trim: true,
    unique: true,
    validate: [validator.isEmail, "Please Enter the valid email"],
  },
  phone: {
    type: Number,
    required: [true, "Please Enter your Phone Number"],
    unique: true,
    minLength: [10, "Phone Number should be 10 Numbers"],
    maxLength: [10, "Phone Number should be 10 Numbers"],
  },
  password: {
    type: String,
    required: [true, "Please Enter the password"],
    trim: true,
    minLength: [6, "password should be greater than or equal to 6 Characters"],
    select: false,
  },
  type: {
    type: String,
    default: "user",
  },
  gender: {
    type: String,
    required: [true, "Please Enter the Gender"],
    trim: true,
  },
  dob: {
    type: Date,
    required: [true, "Please Enter the dob"],
  },
  weight: {
    type: Number,
    required: [true, "Please Enter the weight in Kg"],
  },
  height: {
    type: Number,
    required: [true, "Please Enter the height in cm"],
  },
  goal: {
    type: String,
    required: [true, "Please Enter the Goal"],
  },

},{timestamps:true});

userSchema.path("phone").validate(function validatePhone() {
  return this.phone > 999999999 && this.phone <= 9999999999;
});
module.exports = mongoose.model("User", userSchema);
