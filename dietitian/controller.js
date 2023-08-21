const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const { User } = require("../users/model");

const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const fs = require("fs");
AWS.config.logger = console;


exports.assignDietitian = catchAsyncError(async (req, res, next) => {
    exports.UserRegistration = catchAsyncError(async (req, res, next) => {
      const {
        user_id,
        dietitian_id,
      } = req.body;
      const { profile_image } = req.files;

      if (
        !user_id ||
        !dietitian_id 
      ) {
        return next(new ErrorHander("All fields are required", 400));
      }
      const user = await User.findOne({
        $or: [{ _id: user_id }],
      });
      if (user) {
        console.log(user)
        res.status(200).send({
          success: true,
          message: "User Registration successfully",
        });
      }

    });
});


exports.assignDietitian = catchAsyncError(async (req, res, next) => {});