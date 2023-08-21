const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const User  = require("../users/model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const fs = require("fs");
AWS.config.logger = console;


exports.assignDietitian = catchAsyncError(async (req, res, next) => {
  console.log("the assign dietitian is also ")
      const {
        user_id,
        dietitian_id,
      } = req.body;

      if (
        !user_id ||
        !dietitian_id 
      ) {
        return next(new ErrorHander("All fields are required", 400));
      }
      const user = await User.findOneAndUpdate(
        { _id: user_id }, // Filter for finding the user
        { $set: { dietitian: dietitian_id } }, // Update the "dietitian" parameter
        { new: true } // Return the updated document
      );
      if (user) {
        console.log(user)
        res.status(200).send({
          success: true,
          message: "Updated Scuessfully",
          user:user
        });
      }
});


// exports.assignDietitian = catchAsyncError(async (req, res, next) => {});