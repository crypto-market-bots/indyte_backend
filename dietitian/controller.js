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
  console.log("the assign dietitian is also called")
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


exports.DietitianRegistration = catchAsyncError(async (req, res, next) => {
  const {
    email,
    phone,
    first_name,
    last_name,
    password,
    gender,
    dob,
    weight,
    height,
    qualification,
    goal,
    family_contact_number,
    local_guardian_address,
    local_address,
    permanent_address,
    id_card_number,
    id_card_type,
    photo_id,
    study_details,
    photo,
    experience,
    past_work_details,
  } = req.body;

  console.log(req.body);

  // const { profile_image } = req.files;

  if (
    !email ||
    !phone ||
    !first_name ||
    !last_name ||
    !password ||
    !gender ||
    !dob ||
    !weight ||
    !height ||
    !qualification ||
    !goal ||
    !family_contact_number ||
    !local_guardian_address ||
    !local_address ||
    !id_card_number ||
    !id_card_type ||
    !photo_id ||
    !study_details ||
    !permanent_address ||
    !photo ||
    !experience ||
    !past_work_details
  ) {
    return next(new ErrorHander("All fields are required", 400));
  }

  try {
    const existingDietitian = await dietitian.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingDietitian) {
      return next(new ErrorHander("Dietitian Already Exists", 400));
    }

    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 6) {
      return next(
        new ErrorHander(
          "Password should be greater than or equal to 6 characters",
          400
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(trimmedPassword, salt);

    // const data = await uploadAndPushImage(
    //   profile_image,
    //   "profile_image",
    //   email
    // );

    // if (!data.location) {
    //   return next(new ErrorHander(data));
    // }

    const newDietitian = new dietitian({
      email,
      phone,
      first_name,
      last_name,
      password: hashPassword,
      gender,
      dob: new Date(dob),
      weight,
      height,
      qualification,
      goal,
      family_contact_number,
      local_address,
      local_guardian_address,
      permanent_address,
      id_card_number,
      id_card_type,
      photo_id,
      study_details,
      photo,
      experience,
      past_work_details,
      // image: data.location,
      // profile_image_key: data.key,
    });

    await newDietitian.save();

    res.status(200).send({
      success: true,
      message: "Dietitian Registration successfully",
    });
  } catch (error) {
    return next(new ErrorHander(error.message, 400));
  }
});

exports.DietitianUpdation = catchAsyncError(async (req, res, next) => {
  const dietitianId = req.params.id; // Assuming you get the dietitian ID from the request parameters

  const updateData = req.body; // The data you want to update

  if (updateData.email || updateData.phone) {
    return next(new ErrorHander("Cannot change email or phone number", 400));
  }

  try {
    const updatedDietitian = await dietitian.findByIdAndUpdate(
      dietitianId,
      updateData,
      { new: true } // This option returns the updated document
    );

    if (!updatedDietitian) {
      return next(new ErrorHander("Dietitian not found", 404));
    }

    res.status(200).send({
      success: true,
      message: "Dietitian details updated successfully",
      updatedDietitian, // You can send the updated document as a response
    });
  } catch (error) {
    return next(new ErrorHander(error.message, 400));
  }
});



exports.fetchUser = catchAsyncError(async (req, res, next) => {
  const type = req.query.type;
  const mode = req.user.type;
  console.log(mode);
  try {
    if (!type || (type != "dietitian" && type != "user")) {
      res.status(500).json({ success: false, message: "invalid Type" });
    } else {
      if (type == "dietitian" && mode == "admin") {
        const data = await dietitian.find();
        res.status(201).json({
          success: true,
          data: data,
        });
      } else if (type == "user" && mode == "admin") {
        const data = await User.find();
        res.status(201).json({
          success: true,
          data: data,
        });
      } else if (type == "user" && mode == "dietitian") {
        const data = await User.find();
        res.status(201).json({
          success: true,
          data: data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Can not acess dietitian as dietitian",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "failed to fetch user" });
  }
});


exports.fetchUserDetail = catchAsyncError(async (req, res, next) => {
  type=req.params.type
  id=req.params.id
 const type = req.query.type;
 const mode = req.user.type;
 console.log(mode);
 try {
   if (!type || !id ||(type != "dietitian" && type != "user")) {
     res.status(500).json({ success: false, message: "Incorrect details" });
   } else {
     if (type == "dietitian") {
       const data = await dietitian.find({ _id: id });
       res.status(201).json({
         success: true,
         data: data,
       });
     } else if (type == "user") {
       const data = await User.find({_id:id});
       res.status(201).json({
         success: true,
         data: data,
       });
     }  
   }
 } catch (error) {
   res.status(500).json({ success: false, message: "failed to fetch user details" });
 }
});


// exports.assignDietitian = catchAsyncError(async (req, res, next) => {});