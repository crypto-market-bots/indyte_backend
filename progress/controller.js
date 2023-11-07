const catchAsyncError = require("../middleware/catchAsyncError");
const Progress = require("./model");
const User = require("../users/model");
const moment = require("moment");
const path = require('path')
const AWS = require("aws-sdk");
const ErrorHander = require("../utils/errorhander");
const fs = require('fs'); 
//s3 bucket crediantls
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

exports.newProgress = catchAsyncError(async (req, res, next) => {
  //firstly check the user is exist or not
  const user = await User.findById(req.user.id);
  const { physical_measurement, images, progress_month_year } = req.body;
  if (!user)
    return next(new ErrorHander("User Doesn't exit in our database", 400));

  //Now here we check all the images for upload on s3 bucket
  const { front_image, back_image, left_image, right_image } = req.files;
  const globalObject = {};
  //function to push the image
  async function uploadAndPushImage(image, imageName) {
    if (image) {
      try {
        const imageData = fs.readFileSync(image.tempFilePath);

        // console.log(image.data.buffer)
        const uploadParams = {
          Bucket: "indyte-static-images-new",
          Key: `${progress_month_year}/${user._id}-${imageName}/${user._id}`,
          Body: imageData,
        
          ACL: "public-read",
          ContentType: 'image/jpeg',
        
        };
  
        s3.upload(uploadParams, function (err, data) {
          if (err) {

            return next(new ErrorHander(err, 400));
          } else {
            // console.log(data)
            globalObject[imageName] = data.Location;
          }
        });
      } catch (error) {
        return next(new ErrorHander(`Failed to upload image ${imageName}: ${error.message}`,400))
        
      }
    }
    return;
  }

  async function processImages() {
    await uploadAndPushImage(front_image, "front_image");
    await uploadAndPushImage(back_image, "back_image");
    await uploadAndPushImage(left_image, "left_image");
    await uploadAndPushImage(right_image, "right_image");

  }
  processImages();


  const formattedDate = moment(progress_month_year, "MM-YYYY").format(
    "MM-YYYY"
  );
  //here we traverse the Images and live the images on s3 bucket

  //Now we make the new Progress
  const progress = await Progress.create({
    images: globalObject,
    progress_month_year: formattedDate,
    physical_measurement: physical_measurement,
    created_by: user._id,
  })
    .then(() => {
      res
        .status(201)
        .json({ success: true, message: "Progress created successfully" });
    })
    .catch((err) => {
      return next(new ErrorHander(err, 400));
    });
});

//currently i implement the api for all not for single
exports.allProgress = catchAsyncError(async (req, res, next) => {
  //Here we Implement the pagination for fast the Api
  const progress = await Progress.find({ created_by: req.user.id })
    .sort({ progress_month_year: -1 })
    .exec();

  res.status(200).json({ success: true, data: progress });
});

exports.updateProgress = catchAsyncError(async (req, res, next) => {
  //firstly check the user
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorHander("User Does not exit", 400));

  //NOW check this Progress on the basis of the user
  const { id } = req.params;
  const progress = await Progress.findOne({ _id: id, created_by: user._id });
  if (!progress)
    return next(
      new ErrorHander("Progress of this id doesn't exit in the user")
    );

  const { progress_month_year,physical_measurement } = req.body;
  if (progress_month_year)
    return next(
      new ErrorHander("Your are not able to update the month and year", 400)
    );

  // Upload new images and update progress record
  const { front_image, back_image, left_image, right_image } = req.files;
  const globalObject = {};

  async function uploadAndPushImage(image, imageName) {
    if (image) {
      try {
        const uploadParams = {
          Bucket: "indyte-static-images-new",
          Key: `${progress.progress_month_year}/${user._id}-${imageName}`,
          Body: Buffer.from(image.data),
          ContentType: image.mimetype,
          ACL: "public-read",
        };

        const uploadedImage = await s3.upload(uploadParams).promise();
        globalObject[imageName] = uploadedImage.Location;

        // Delete the previous image if it exists
        if (progress.images[imageName]) {
          const params = {
            Bucket: "indyte-static-images-new",
            Key: progress.images[imageName].split("/").pop(),
          };
          await s3.deleteObject(params).promise();
        }
      } catch (error) {
        console.error(`Failed to upload image ${imageName}: ${error.message}`);
      }
    }
  }

  await uploadAndPushImage(front_image, "front_image");
  await uploadAndPushImage(back_image, "back_image");
  await uploadAndPushImage(left_image, "left_image");
  await uploadAndPushImage(right_image, "right_image");

  progress.images = globalObject;
  if (!progress.physical_measurement) {
    progress.physical_measurement = {}; // Initialize as an empty object
  }

  for (let key in physical_measurement) {
    if (physical_measurement.hasOwnProperty(key)) {
      const value = physical_measurement[key];
      progress.physical_measurement[key] = value;
    }
  }
  await progress.save();
  res.status(200).json({success:true,message:"Successfully update"})

});
