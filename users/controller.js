const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const dietitian = require("../dietitian/model");
const { uploadAndPushImage, deleteS3Object } = require("../Common/uploadToS3");
const User = require("../users/model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const fs = require("fs");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_TOKEN;
console.log(accountSid, authToken);
const client = require("twilio")(accountSid, authToken);

const crypto = require("crypto");
const { runInNewContext } = require("vm");
// const Seller = require("../models/sellerModel");
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
AWS.config.logger = console;
//s3 bucket crediantls
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.UserRegistration = catchAsyncError(async (req, res, next) => {
  const {
    email,
    phone,
    full_name,
    password,
    gender,
    dob,
    weight, // Use a single weight field (either kg or lbs)
    height, // Use a single height field (either cm or ft/in)
    goal_weight,
    weight_unit, // Weight unit (lbs or kg)
    height_unit, // Height unit (cm or ft)
  } = req.body;
  const profile_image = req?.files?.profile_image;

  if (
    !email ||
    !phone ||
    !full_name ||
    !password ||
    !gender ||
    !dob ||
    !weight ||
    !height ||
    !goal_weight ||
    !weight_unit ||
    !height_unit
  ) {
    return next(new ErrorHander("All fields are required", 400));
  }

  const user = await User.findOne({
    $or: [{ email: email }, { phone: phone }],
  });

  if (user) {
    return next(new ErrorHander("User Already Exists", 400));
  }

  let trimmedPassword = password.trim();

  if (trimmedPassword.length < 6) {
    return next(
      new ErrorHander(
        "Password should be greater than or equal to 6 Characters",
        400
      )
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(trimmedPassword, salt);

  // Convert weight to kg if it's in lbs
  let weight_kg = weight;
  if (weight_unit === "lbs") {
    weight_kg = weight * 0.453592;
  }

  // Convert height to cm if it's in ft
  let height_cm = height;
  if (height_unit === "ft") {
    const [feet, inches] = height.split("'");
    height_cm = parseFloat(feet) * 30.48 + parseFloat(inches) * 2.54;
  }

  // Calculate BMI
  const bmi = (weight_kg / (height_cm / 100) ** 2).toFixed(2);

  req.body.dob = new Date(dob);
  req.body.password = hashPassword;
  req.body.initial_weight = weight_kg; // Store initial weight in kg
  req.body.bmi = null; // Include BMI in user registration

  // Include weight_unit and height_unit
  req.body.weight_unit = weight_unit;
  req.body.height_unit = height_unit;
  req.body.intial_weight = weight;
  if (profile_image) {
    const data = await uploadAndPushImage(
      "user/profile",
      profile_image,
      "profile_image",
      email
    );
    console.log(data);
    if (!data.location) {
      return next(new ErrorHander(data));
    }

    req.body.image = data.location;
    req.body.profile_image_key = `user/profile/${data.key}`;
  } else {
    req.body.image = process.env.DEFAULT_PROFILE_IMAGE_URL;
  }
  const doc = await User.create(req.body)
    .then(() => {
      res.status(200).send({
        success: true,
        message: "User Registration successfully",
      });
    })
    .catch((error) => {
      return next(new ErrorHander(error, 400));
    });
});

// exports.loginUser = catchAsyncError(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (email && password) {
//     ////"hello");

//     if (user) {
//       //  //user);
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (user.email == email && isMatch) {
//         // Generate JWT Token
//         const token = jwt.sign(
//           { userID: user._id },
//           process.env.JWT_SECRET_KEY,
//           { expiresIn: "5d" }
//         );

//         //res.send({"status": "success","message":"LOGIN sucessful","token": token})
//         res.status(200).json({
//           success: true,
//           message: "Login Successful",
//           token: token,
//         });
//       } else {
//         return next(new ErrorHander("Email or password is not valid", 400));
//       }
//     } else {
//       return next(new ErrorHander("Email or password is not valid", 400));
//     }
//   } else {
//     return next(new ErrorHander("All fields are required", 400));
//   }
// });

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || password) {
    next(new ErrorHandler(`All field are required`, 400));
  }
  let user;
  user = await User.findOne({ email: email }).select("+password");

  if (user) {
    return next(new ErrorHander("Email or password is not valid", 400));
  }
  console.log(user);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // Generate JWT Token
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    //res.send({"status": "success","message":"LOGIN sucessful","token": token})
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token: token,
      data: user,
    });
  } else {
    return next(new ErrorHander("Email or password is not valid", 400));
  }
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const { from } = req.query;
  let user;
  if (from) {
    user = await dietitian.findById(req.user.id);
  } else {
    user = await User.findById(req.user.id);
  }
  if (!user) return next(new ErrorHander("user doesn't exit", 400));
  res.status(200).json({ success: true, user: user });
});

exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user)
    return next(
      new ErrorHander("Some error occurred. User doesn't exist. Try again", 400)
    );

  // Check if certain fields cannot be updated
  if (req.body.email || req.body.phone || req.body.password || req.body.type)
    return next(
      new ErrorHander("You are not able to change the email, phone & Type", 400)
    );

  // Check if a profile image is provided in the request
  if (req.files && req.files.profile_image) {
    try {
      const data = await uploadAndPushImage(
        "user/profile",
        req.files.profile_image,
        "profile_image",
        user.email
      );
      console.log(data);
      if (!data.location) return next(new ErrorHander(data));
      // ...

      user.image = data.location;
      user.profile_image_key = data.key;
      await deleteS3Object(user.profile_image_key);
    } catch (error) {
      return next(new ErrorHander(error));
    }
  }

  // Define a mapping of field names to user properties
  const fieldMap = {
    height_unit: "height_unit",
    current_meal_type: "current_meal_type",
    food_dislikes: "food_dislikes",
    food_allergies: "food_allergies",
    medical_history: "medical_history",
    supplements_or_herbs: "supplements_or_herbs",
    skip_meals_frequency: "skip_meals_frequency",
    occupation: "occupation",
    office_timing: "office_timing",
    location: "location",
    lifestyle: "lifestyle",
    height: "height",
    full_name: "full_name",
    gender: "gender",
    dob: "dob",
    current_weight: "current_weight",
    goal_weight: "goal_weight",
    initial_weight: "initial_weight",
    goal: "goal",
    physical_activity: "physical_activity",
    weight_unit: "weight_unit",
    skip_meal: "skip_meal",
    bmi: "bmi",
  };
  console.log(typeof req.body.lifestyle, " ", req.body.lifestyle);
  // Iterate through the mapping and update user properties
  for (const field in fieldMap) {
    if (req.body[field]) {
      user[fieldMap[field]] = req.body[field];
      console.log(user[fieldMap[field]], " ", req.body[field]);
    }
  }

  // Save the updated user profile
  await user.save();

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
});

// Function to delete an S3 object and return a promise

//this controller is run when we fill prevous password also
exports.changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { old_password, password, confirm_password } = req.body;
  if (!old_password || !password || !confirm_password)
    return next(new ErrorHander("All fields are required"));
  const user = await User.findById(req.user.id).select("+password");
  if (!user) next(new ErrorHander("User does not exists", 400));
  // const isPasswordMatched = await user.comparePassword(old_password);
  const isPasswordMatched = await bcrypt.compare(old_password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHander("Old_Password does'n match", 400));
  }
  if (password == old_password)
    return next(
      new ErrorHander("Current Password must not be same as new password")
    );
  if (password != confirm_password) {
    next(new ErrorHander("Passowrd and Confirm Password is mathch", 400));
  }

  if (isPasswordMatched) {
    let trimmedpassword = password;
    trimmedpassword = trimmedpassword.trim();
    //trimmedpassword);
    if (trimmedpassword.length < 6) {
      return next(
        new ErrorHander(
          "password should be greater than or equal to 6 Characters",
          400
        )
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashPassword },
    });

    res.status(200).json({
      success: true,
      message: "password Change sucessfully",
    });
  }
  //isPasswordMatched);
});

//this controller is used when we forget our password
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email, password, confirm_password } = req.body;
  if (!email || !password || !confirm_password)
    return next(
      new ErrorHander("Please give the password and confirm_password", 400)
    );
  const user = await User.findOne({ email }).select("+password");
  if (user) {
    if (password === confirm_password) {
      const isPreviousPasswordMatched = await bcrypt.compare(
        password,
        user.password
      );
      if (isPreviousPasswordMatched) {
        return next(
          new ErrorHander("New Password must be different from old password")
        );
      } else {
        let trimmedpassword = password;
        trimmedpassword = trimmedpassword.trim();
        if (trimmedpassword.length < 6) {
          return next(
            new ErrorHander(
              "password should be greater than or equal to 6 Characters",
              400
            )
          );
        }
        //check the validity of hash

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(trimmedpassword, salt);
        await User.findByIdAndUpdate(user._id, {
          $set: { password: hashPassword },
        });

        res.status(200).json({
          success: true,
          message: "Password Changed sucessfully",
        });
      }
    } else {
      return next(
        new ErrorHander("Password and Confirm Password is must be same", 400)
      );
    }
  } else {
    return next(new ErrorHander("User doesn't exists with this email", 400));
  }
});

exports.sendOTPForLogin = catchAsyncError(async (req, res, next) => {
  var { phone } = req.body;
  if (!phone) {
    return next(
      new ErrorHander("Please enter the phone number for sending the OTP")
    );
  }
  // console.log(phone);
  const user = await User.findOne({ phone: phone });
  console.log(user);
  if (!user) return next(new ErrorHander("User Is not Registered", 400));
  phone = "+91" + phone;
  console.log("these are envs", accountSid, authToken);

  const otp = Math.floor(100000 + Math.random() * 900000);

  const ttl = 5 * 60 * 1000; //5 minutes
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}.login`;
  const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");
  const fullHash = `${hash}.${expires}`;
  console.log("hash", twilioNum, phone);
  client.messages
    .create({
      body: `Your One Time Login Password For Indyte is ${otp} . Valid only for 5 minutes`,
      from: twilioNum,
      friendlyName: "My First Verify Service",
      to: phone,
    })
    .then((messages) => {
      res.status(200).send({ phone, hash: fullHash });
    })
    .catch((err) => {
      console.log(err);
      return next(new ErrorHander(err, 400));
    });
});

exports.verifyOtpforLogin = catchAsyncError(async (req, res, next) => {
  var { phone, hash, otp } = req.body;
  const user = await User.findOne({ phone: phone });
  if (!user) return next(new ErrorHander("User not found", 400));
  if (!(phone && hash && otp)) {
    return next(new ErrorHander("Please enter the credantials", 400));
  }
  phone = "+91" + phone;
  let [hashValue, expires] = hash.split(".");
  //"56789876567"=7777777777777777777
  let now = Date.now(); //99999999999999
  if (now > parseInt(expires)) {
    return next(new ErrorHander("Time out.", 400));
  }
  let data = `${phone}.${otp}.${expires}.login`;
  let newCalculatedHash = crypto
    .createHmac("sha256", smsKey)
    .update(data)
    .digest("hex");
  if (newCalculatedHash === hashValue) {
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    //res.send({"status": "success","message":"LOGIN sucessful","token": token})
    res.status(200).json({
      success: true,
      message: "Login Successful",
      token: token,
      data: user,
    });
  } else {
    return next(new ErrorHander("Incorrect Crediantals", 401));
  }
});

exports.deleteS3Image = catchAsyncError(async (req, res, next) => {
  const { key } = req.query;
  console.log("This is key from Api", key);
  await deleteS3Object(key);
  res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
});
