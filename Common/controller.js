const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../users/model");
const { Meal, UserMealRecommendation } = require("../mealPlanner/model");
const { Workout, workoutRecommendation } = require("../workoutTracker/model");
const { ObjectId } = require('mongodb');
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
// const { transporter, use } = require("../Config/email");
// const sendEmail = require("../utils/sendEmail");
// dotenv.config({ path: "../Config/config.env" });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_TOKEN;
console.log(accountSid,authToken)
const client = require("twilio")(accountSid, authToken);

const crypto = require("crypto");
const { runInNewContext } = require("vm");
const { uploadAndPushImage } = require("./uploadToS3");
// const Seller = require("../models/sellerModel");
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;




exports.sendOTP = catchAsyncError(async (req, res, next) => {
  // const phone = req.phone;
  const phone = "+91"+ req.phone;
  // phone =+phone;
  console.log("these are envs",accountSid,authToken)

  const otp = Math.floor(100000 + Math.random() * 900000);
  
  const ttl = 5 * 60 * 1000;
const expires = Date.now() + ttl;
const data = `${phone}.${otp}.${expires}`;
const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");
const fullHash = `${hash}.${expires}`;
console.log("hash",twilioNum,phone)
client.messages
  .create({
    body: `Your One Time Login Password For Indyte is ${otp} . Valid only for 2 minutes`,
    from: twilioNum,
    friendlyName: "My First Verify Service",
    to: phone,
  })
  .then((messages) => {
    res.status(200).send({ phone, hash: fullHash });
  })
  .catch((err) => {
    console.log(err)
    return next(new ErrorHander(err, 400));
  });

  // If none of the error conditions are met, proceed with sending OTP
  // next();

  
});



exports.getHistory = catchAsyncError(async (req, res, next) => {
  try {
    const { type, user_id } = req.body;
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * per_page;

    console.log("body",req.body)
    
    if (!user_id || !type) {
      return next(new ErrorHander("All field are required ", 400));
    }

    if (!ObjectId.isValid(user_id)) {
      return next(new ErrorHander("Invalid user_id", 400));
    }

    let historyData

    let DatabaseName;
    if(type==="workout"){
      console.log("into workout Block")
      DatabaseName=workoutRecommendation
      populationKeyName='workout_id'
    }
    else if(type==="meal"){
      console.log("into Meal Block")
      
      DatabaseName=UserMealRecommendation
      populationKeyName='meal'
    }
    else{
      console.log("into meal Block")
      DatabaseName=UserMealRecommendation
      populationKeyName='meal'
    }

    const totalResultLength = await DatabaseName.countDocuments({
      $or: [{ user: user_id }],
    });
    
    historyData = await DatabaseName.find({
      $or: [{ user: user_id }],
    }).populate(populationKeyName)
    .skip(skip) // Skip the appropriate number of documents
    .limit(per_page);

    res.status(200).json({
      success: true,
      data: historyData,
      length: totalResultLength,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});


exports.uploadImage = catchAsyncError(async(req,res,next)=>{

 

  const data = await uploadAndPushImage(
    "default/profile_image",
    req.files.image,
    "profile_image",
    "indyte@example.com"
  );
  console.log(data);
})


