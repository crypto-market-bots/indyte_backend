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


// exports.getHistorydatabaseHanding = catchAsyncError(async (req, res, next) => {
//     try {
//       const { type, user_id } = req.body;
//       const page = parseInt(req.query.page) || 1;
//       const per_page = parseInt(req.query.perPage) || 10;
//       const skip = (page - 1) * per_page;
  
//       console.log("body",req.body)
      
//       if (!user_id || !type) {
//         return next(new ErrorHander("All field are required ", 400));
//       }
  
//       if (!ObjectId.isValid(user_id)) {
//         return next(new ErrorHander("Invalid user_id", 400));
//       }
  
//       let historyData
  
//       let DatabaseName;
//       if(type==="workout"){
//         DatabaseName=workoutRecommendation
//         populationKeyName='workout_id'
//       }
//       else if(type==="meal"){
//         DatabaseName=UserMealRecommendation
//         populationKeyName='meal'
//       }
//       else{
//         DatabaseName=UserMealRecommendation
//         populationKeyName='meal'
//       }
      
//       historyData = await DatabaseName.find({
//         $or: [{ user: user_id }],
//       }).populate(populationKeyName)
//       .skip(skip) // Skip the appropriate number of documents
//       .limit(per_page);
  
//       res.status(200).json({
//         success: true,
//         data: historyData,
//       });
//     } catch (error) {
//       // Handle any error that occurred during the process
//       return next(new ErrorHander(error.message, 500));
//     }
//   });
  
