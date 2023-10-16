const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const  dietitian = require("../dietitian/model");
const { uploadAndPushImage, deleteS3Object } = require("../Common/uploadToS3");
const User = require("../users/model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const fs = require("fs");
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
  const { profile_image } = req.files;

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
  if (weight_unit === 'lbs') {
    weight_kg = weight * 0.453592;
  }

  // Convert height to cm if it's in ft
  let height_cm = height;
  if (height_unit === 'ft') {
    const [feet, inches] = height.split("'");
    height_cm = (parseFloat(feet) * 30.48) + (parseFloat(inches) * 2.54);
  }

  // Calculate BMI
  const bmi = (weight_kg / ((height_cm / 100) ** 2)).toFixed(2);

  req.body.dob = new Date(dob);
  req.body.password = hashPassword;
  req.body.initial_weight = weight_kg; // Store initial weight in kg
  req.body.bmi = null; // Include BMI in user registration

  // Include weight_unit and height_unit
  req.body.weight_unit = weight_unit;
  req.body.height_unit = height_unit;
  req.body.intial_weight = weight;

  const data = await uploadAndPushImage(
    "user/profile",
    profile_image,
    "profile_image",
    email
  );

  if (!data.location) {
    return next(new ErrorHander(data));
  }

  req.body.image = data.location;
  req.body.profile_image_key = `user/profile/${data.key}`;

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

exports.login =catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    const {type} =req.query
    let user;
    if (email && password ) {
      if(type==="email"){
        user = await User.findOne({ email:email }).select("+password");
      }
      else if(type==="phone"){
        user = await User.findOne({ phone:phone }).select("+password");
      }
    else{
          return next(new ErrorHander("Invalid Type  ", 400));
        }
      

      if (user) {
        console.log(user)
        //  //user);
        // const isMatch = password===user.password
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email == email && isMatch) {
          // Generate JWT Token
          const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );

          //res.send({"status": "success","message":"LOGIN sucessful","token": token})
          res.status(200).json({
            success: true,
            message: "Login Successful",
            token: token,
            data:user
          });
        } else {
          return next(new ErrorHander("Email or password is not valid", 400));
        }
      } else {
        return next(new ErrorHander("Email or password is not valid", 400));
      }
    } else {
      return next(new ErrorHander("All fields are required", 400));
    }
  });


exports.getUser = catchAsyncError(async (req, res, next) => {
  const {from} =req.query
  let user;
  if(from){
    user = await dietitian.findById(req.user.id);
  }
  else{
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
        req.files.profile_image,
        "profile_image",
        user.email
      );
      console.log(data);
      if (!data.location) return next(new ErrorHander(data));
      // ...

      user.image = data.location;
      user.profile_image_key = data.key;
      await deleteS3Object(user.profile_image_key)
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
  };

  // Iterate through the mapping and update user properties
  for (const field in fieldMap) {
    if (req.body[field]) {
      user[fieldMap[field]] = req.body[field];
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


exports.deleteS3Image = catchAsyncError(async (req, res, next) => {
  const {key}=req.query
  console.log("This is key from Api",key)  
  await deleteS3Object(key);
  res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
});