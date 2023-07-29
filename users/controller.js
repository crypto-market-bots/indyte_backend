const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const User = require("../users/model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const fs = require('fs'); 
//s3 bucket crediantls
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});



// const userOtpVerification = require("./userOtpVerfication");
exports.registration = catchAsyncError(async (req, res, next) => {
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
    goal,
  } = req.body;
  const {profile_image} = req.files

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
    !goal
  ) {
    return next(new ErrorHander("All fields are required", 400));
  }
  const user = await User.findOne({
    $or: [{ email: email }, { phone: phone }],
  });
  if (user) {
    return next(new ErrorHander("User Already Exist", 400));
  }
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
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(trimmedpassword, salt);
  req.body.dob = new Date(dob);
  req.body.password = hashPassword;

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function uploadAndPushImage(image, imageName) {
    if (image) {
      try {

        // Generate a random number using Math.random()
        const randomNumber = getRandomNumber(100000, 999999);
        // Construct the imageName using the profilepic-email-randomnumber format
        const key = `${imageName}-${email}-${randomNumber}`;
        
        const imageData = fs.readFileSync(image.tempFilePath);

        const uploadParams = {
          Bucket: "indyte-static-images",
          Key: key,
          Body: imageData,
          ACL: "public-read",
          ContentType: 'image/jpeg',
        };
  
        // Wrap the s3.upload function in a Promise
        const uploadPromise = new Promise((resolve, reject) => {
          s3.upload(uploadParams, function (err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
  
        // Wait for the upload to complete and get the data from the Promise
        const uploadedData = await uploadPromise;
        req.body.image = uploadedData.Location;
      } catch (error) {
        return next(new ErrorHander(`Failed to upload image ${imageName}: ${error.message}`, 400));
      }
    }
    return;
  }
  
  await uploadAndPushImage(profile_image, "profile_image");
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

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    ////"hello");
    const user = await User.findOne({ email }).select("+password");
    if (user) {
      //  //user);
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
 
exports.getUser= catchAsyncError(async(req,res,next)=>{
const user = await User.findById(req.user.id);
if(!user) return next(new ErrorHander("user does n't exit",400))
res.status(200).json({success:true,user:user})
}
) 
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user)
    return next(
      new ErrorHander("Some error occured. User doesn't exits Try again", 400)
    );
  if (req.body.email || req.body.phone || req.body.password || req.body.type)
    return next(
      new ErrorHander("you are not able to change the email, phone & Type", 400)
    );
    const userupdate = await User.findByIdAndUpdate(user._id, req.body, {
      new: true,
    runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      message: "user Details Update successfully",
    });
});

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
