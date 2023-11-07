const catchAsyncError = require("../middleware/catchAsyncError");
const { Workout, workoutRecommendation } = require("./model");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const { WeightTracker } = require("../weightTracker/model");
const User = require("../users/model");
const ErrorHander = require("../utils/errorhander");
const mongoose = require("mongoose");
const moment = require("moment");

exports.updateMyWeight = catchAsyncError(async (req, res, next) => {
  const { current_weight, goal_weight } = req.body;
  const proof_image = req?.files?.proof_image;
  if (!current_weight || !goal_weight || !proof_image) {
    return next(new ErrorHander("All fields are required", 400));
  }
  try {
    const newWeightRequest = new WeightTracker({
      user: req.user.id,
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


exports.handlingUpdateValidation = catchAsyncError(async (req, res, next) => {
  const {status,id} = req.body;
  
  if (!status || !id) {
    return next(new ErrorHander("All field are required",500))
  }

  if(status!=="pending" && status!=="approved" && status=="rejected"){
    return next(new ErrorHander("Invalid status",500))
  } 
});



exports.updateWeightStatus = catchAsyncError(async (req, res, next) => {
  // api for customers and meal planner
  const {status,id,goal_weight,current_weight} = req.body;
  
  if (!status || !id) {
    return next(new ErrorHander("All field are required",500))
  }

  if(status!=="pending" && status!=="approved" && status=="rejected"){
    return next(new ErrorHander("Invalid status",500))
  } 


});


exports.configuringApprovedActions = catchAsyncError(async (req, res, next) => {
  // api for customers and meal planner
  const {status,user,goal_weight,current_weight,weight_tracking_id} = req.body;
  try {
    const userWeightUpdate=await User.findOneAndUpdate(
      { _id: user }, 
      { $set: {goal_weight, current_weight } }, // Update fields
      { new: true } 
    )
    if(goal_weight===current_weight){
      const WeightUpdate=await WeightTracker.findOneAndUpdate(
        { _id: weight_tracking_id }, 
        { $set: { isCompleted:true } }, // Update fields
        { new: true } 
      )
    }
  }catch{

  }

  



  

});



exports.getWeight = catchAsyncError(async (req, res, next) => {
  try {
    const { id, type, value } = req.query;
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * per_page;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHander("Invalid User ID", 400));
    }

    let weightTrackerData;

    if (type === "rejected") {
      console.log("All condtition triggered");
      weightTrackerData = await WeightTracker.find({
        user: id,
      });
    } else if (type === "approved") {
      console.log(value);
      const requestedDate = new Date(value);
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 1, 0, 0); // Set to 00:01 of the requested day

      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999); // Set to 23:59 of the requested day

      console.log("startOfDay:", startOfDay);
      console.log("endOfDay:", endOfDay);

      weightTrackerData = await WeightTracker.find({
        user: id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
    } 
    res.status(201).json({
      success: true,
      message: "Success",
      data: weightTrackerData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// exports.userMealRecommendationFetch = catchAsyncError(
//   async (req, res, next) => {
//     try {
//       const { user } = req.params;
//       const { type, value } = req.query;
//       console.log(type, value);

//       const today = new Date();
//       let meal_recomadation;

//       console.log(today, "this is today date");
//       if (!user) {
//         return next(new ErrorHander("All field are required ", 400));
//       }

//       if (type === "all") {
//         // console.log("All condtition triggered")
//         meal_recomadation = await UserMealRecommendation.find({
//           $or: [{ user: user }],
//         }).populate({
//           path: "meal",
//         });
//       } else if (type === "date" && value) {
//         console.log(value, "this is today date");
//         const startOfDay = new Date(value);
//         startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date(value);
//         endOfDay.setHours(23, 59, 59, 999);
//         console.log("startOfDay:", startOfDay);
//         console.log("endOfDay:", endOfDay);

//         meal_recomadation = await UserMealRecommendation.find({
//           $or: [{ user: user }],
//           date: { $gte: startOfDay, $lte: endOfDay },
//         }).populate({
//           path: "meal",
//         });
//       } else {
//         const startOfDay = new Date(today);
//         startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date(today);
//         endOfDay.setHours(23, 59, 59, 999);
//         meal_recomadation = await UserMealRecommendation.find({
//           $or: [{ user: user }],
//           date: { $gte: startOfDay, $lte: endOfDay },
//         }).populate({
//           path: "meal",
//         });
//       }

//       if (meal_recomadation) {
//         res.status(201).json({ success: true, data: meal_recomadation });
//       } else {
//         res
//           .status(500)
//           .json({ success: true, message: "Failed to fetch recommandtion" });
//       }
//     } catch (error) {
//       res
//         .status(500)
//         .json({ error: "Failed to fetch user meal recommendations" });
//     }
//   }
// );
