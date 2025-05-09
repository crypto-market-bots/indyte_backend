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

exports.assignDietitian = catchAsyncError(async (req, res, next) => {
  console.log("the assign dietitian is also ");
  const { user_id, dietitian_id } = req.body;

  if (!user_id || !dietitian_id) {
    return next(new ErrorHander("All fields are required", 400));
  }
  const user = await User.findOneAndUpdate(
    { _id: user_id }, // Filter for finding the user
    { $set: { dietitian: dietitian_id } }, // Update the "dietitian" parameter
    { new: true } // Return the updated document
  );
  if (user) {
    console.log(user);
    res.status(200).send({
      success: true,
      message: "Updated Scuessfully",
      user: user,
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
    id_card_number,
    id_card_type,
    study_details,
    experience,
    past_work_details,
  } = req.body;


  const local_address = {
    address_line1: req.body["local_address[address_line1]"],
    address_line2: req.body["local_address[address_line2]"],
    city: req.body["local_address[city]"],
    state: req.body["local_address[state]"],
    zip: req.body["local_address[zip]"],
    country: req.body["local_address[country]"],
  };

  const local_guardian_address = {
    address_line1: req.body["local_guardian_address[address_line1]"],
    address_line2: req.body["local_guardian_address[address_line2]"],
    city: req.body["local_guardian_address[city]"],
    state: req.body["local_guardian_address[state]"],
    zip: req.body["local_guardian_address[zip]"],
    country: req.body["local_guardian_address[country]"],
  };

  const permanent_address = {
    address_line1: req.body["permanent_address[address_line1]"],
    address_line2: req.body["permanent_address[address_line2]"],
    city: req.body["permanent_address[city]"],
    state: req.body["permanent_address[state]"],
    zip: req.body["permanent_address[zip]"],
    country: req.body["permanent_address[country]"],
  };

  // const { profile_photo, id_card_photo } = req?.files;

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
    !family_contact_number ||
    !local_guardian_address ||
    !local_address ||
    !id_card_number ||
    !id_card_type ||
    !study_details ||
    !permanent_address ||
    !experience ||
    !past_work_details
  ) {
    return next(new ErrorHander("All fields are required", 400));
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    console.log("email", email, "phone is phone", phone);
    const existingDietitian = await dietitian.findOne({
      $or: [{ email: normalizedEmail }, { phone: phone }],
    });

    if (existingDietitian) {
      console.log("Existing dietitian email:", existingDietitian.email);
      console.log("Provided email:", email);
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
      study_details,
      experience,
      past_work_details,
      // image: data.location,
      // profile_image_key: data.key,
    });

    // const profile_picture_data = await uploadAndPushImage(
    //   "dietitian/profile",
    //   profile_photo,
    //   "profile_image",
    //   email
    // );

    // if (!profile_picture_data.location) return next(new ErrorHander("some error occured while uploading profile",400));
    // newDietitian.profile_photo = profile_picture_data.location;
    // newDietitian.profile_photo_key = profile_picture_data.key;
    // console.log(
    //   "req.body.image",
    //   profile_picture_data.location,
    //   profile_picture_data.key
    // );

    // const id_card_data = await uploadAndPushImage(
    //   "dietitian/document",
    //   id_card_photo,
    //   "profile_image",
    //   email
    // );

    // if (!id_card_data.location) return next(new ErrorHander(data));
    // newDietitian.id_card_photo = id_card_data.location;
    // newDietitian.id_card_photo_key = id_card_data.key;
    // console.log("req.body.image", id_card_data.location, id_card_data.key);

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
      updatedDietitian, // You can send the upd document as a response
    });
  } catch (error) {
    return next(new ErrorHander(error.message, 400));
  }
});

exports.fetchUser = catchAsyncError(async (req, res, next) => {
  const type = req.query.type;
  const mode = req.user.type;
  console.log(mode);
  console.log(type);
  try {
    if (!type || (type != "dietitian" && type != "user")) {
      res.status(500).json({ success: false, message: "invalid Type" });
    } else {
      if (type == "dietitian" && mode == "admin") {
        console.log("it Come here");
        const data = await dietitian.find();
        res.status(201).json({
          success: true,
          data: data,
        });
      } else if (type == "user") {
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
  const type = req.query.type;
  const mode = req.user.type;
  const { id } = req.params;

  try {
    if (!type || !id || (type !== "dietitian" && type !== "user")) {
      return res.status(400).json({ success: false, message: "Incorrect details" });
    }

    let data;
    if (type === "dietitian") {
      data = await dietitian.findOne({ _id: id });
    } else if (type === "user") {
      data = await User.findOne({ _id: id }).populate("dietitian", "first_name last_name");
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
});


// exports.assignDietitian = catchAsyncError(async (req, res, next) => {});
