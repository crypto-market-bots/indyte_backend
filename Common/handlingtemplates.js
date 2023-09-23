const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const User = require("../users/model");
const dietitian = require("../dietitian/model");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const fs = require("fs");
AWS.config.logger = console;


exports.handlingtemplates=() => catchAsyncError(async (req, res, next) => {
   

    
  });