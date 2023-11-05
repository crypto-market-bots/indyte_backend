const moment = require("moment");
const catchAsyncError = require("../middleware/catchAsyncError");
const { Workout, workoutRecommendation } = require("./model");
const { Exercise } = require("../exercises/model");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const WeightTracker = require("../weightTracker/model");
const ErrorHander = require("../utils/errorhander");

exports.updateMyWeight = catchAsyncError(async (req, res, next) => {
  const { current_weight, goal_weight } = req.body;
  const proof_image = req?.files?.proof_image;
  if (!current_weight || !goal_weight || !proof_image) {
    return next(new ErrorHander("All fields are required", 400));
  }
  try {
    const newWeightRequest = new WeightTracker({
      user_id: req.user.id,
      current_weight,
      goal_weight,
      status: "pending",
    });

    const weight_proof_image_data = await uploadAndPushImage(
      "images/weightTracker",
      proof_image,
      "weight_proof_image",
      req.user.name
    );

    if (!weight_proof_image_data.location) return next(new ErrorHander(data));
    newWeightRequest.proof_image = weight_proof_image_data.location;
    newWeightRequest.proof_image_key = `images/equipment${weight_proof_image_data.key}`;
    console.log(
      "req.body.image",
      weight_proof_image_data.location,
      weight_proof_image_data.key
    );

    const savedWeightTracking = await newWeightRequest.save();

    if (!savedWeightTracking) {
      return next(
        new ErrorHandler("Failed to save exercise to the database", 500)
      );
    }

    res.status(201).json({
      success: true,
      message: "Equipment added successfully",
      data: savedWeightTracking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

exports.updateWeightStatus = catchAsyncError(async (req, res, next) => {
  // api for customers and meal planner
  const workout_recom_date = req.params.date;
  const workout_recom_date_formatted = moment(workout_recom_date, "DD-MM-YYYY");

  if (!workout_recom_date_formatted) {
    res.status(500).json({ error: "workout_recom_date not found." });
  }

  workoutRecommendation
    .find({
      $and: [
        { user: req.user.id },
        {
          schedule_time: {
            $gte: workout_recom_date_formatted.toDate(),
            $lt: workout_recom_date_formatted.clone().endOf("day").toDate(),
          },
        },
      ],
    })
    .then((recommendations) => {
      res.status(201).json({ success: true, message: recommendations });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Failed to fetch workout recommendations." });
    });
});

exports.getWeight = catchAsyncError(async (req, res, next) => {
  try {
    const {user_id}=req.query
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * per_page;

    const totalResultLength = await WeightTracker.countDocuments({
      $or: [{ user: user_id }],
    });
    
    weightTrackerData = await WeightTracker.find({
      $or: [{ user: user_id }],
    })
    .skip(skip) 
    .limit(per_page);

    
    res
      .status(201)
      .json({ success: true, message: "Success", data: weightTrackerData, totalResultLength});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
