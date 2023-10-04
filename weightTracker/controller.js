const catchAsyncError = require("../middleware/catchAsyncError");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const ErrorHander = require("../utils/errorhander");
const  WeightTracking  = require("./model");
const  User  = require("../users/model");
const moment = require("moment");


exports.updateWeight = catchAsyncError(async (req, res,next) => {
  try {
    // Parse and validate input data
    const {  currentWeight, goalWeight, proof_Image } = req.body;

    if (
      !currentWeight ||
      !goalWeight ||
      !proof_Image 
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }
    // Validate the proof image here if needed.

    // Create a new weight tracking record
    const weightTracking = new WeightTracking({
      userId: req.user._id,
      currentWeight,
      goalWeight,
      proof_Image,
    });

    // Save the weight tracking record
    await weightTracking.save();

    res.status(201).json({ success: true, message: 'Weight update submitted for approval' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.getWeightsByUserId = catchAsyncError(async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.user.id;
    console.log(req.user)


    // Find the user by ID and select only the desired fields
    const user = await User.findById(req.user.id) .select('-_id current_weight goal_weight initial_weight bmi');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve weights' });
  }
});

exports.getWeightsApp = catchAsyncError(async (req, res) => {
  try {
    // Get parameters from the request
    const user_id  = req.user.id;
    const { type, value } = req.query;
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.perPage) || 3;
    const skip = (page - 1) * per_page;

    // Get today's date
    const today = new Date();

    let weights;

    // Check the type parameter and handle accordingly
    if (type === "today") {
      // Retrieve all values for the user
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      weights = await WeightTracking.find({
        userId: user_id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
         ;
    } else if (type === "date" && value) {
      // Retrieve values for a specific date
      const startOfDay = new Date(value);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(value);
      endOfDay.setHours(23, 59, 59, 999);
      weights = await WeightTracking.find({
        userId: user_id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).limit(per_page).skip(skip);      ;
    } else {
      // Default: Retrieve values for today
      weights = await WeightTracking.find({ userId: user_id }).limit(per_page);   
    }

    return res.status(200).json({ success: true, data: weights });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve weights' });
  }
});


exports.getWeights = catchAsyncError(async (req, res) => {
  try {
    // Get parameters from the request
    const { user_id } = req.params.userId;
    const { type, value } = req.query;

    // Get today's date
    const today = new Date();

    let weights;

    // Check the type parameter and handle accordingly
    if (type === "all") {
      // Retrieve all values for the user
      weights = await WeightTracking.find({ userId: user_id });
    } else if (type === "date" && value) {
      // Retrieve values for a specific date
      const startOfDay = new Date(value);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(value);
      endOfDay.setHours(23, 59, 59, 999);
      weights = await WeightTracking.find({
        userId: user_id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
    } else {
      // Default: Retrieve values for today
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      weights = await WeightTracking.find({
        userId: user_id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
    }

    return res.status(200).json({ success: true, data: weights });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve weights' });
  }
});


exports.approveWeight = catchAsyncError(async (req, res) => {
  try {
    const weightTrackingId = req.params.id;

    // Find the weight tracking record by ID
    const weightTracking = await WeightTracking.findById(weightTrackingId);

    if (!weightTracking) {
      return res.status(404).json({ success: false, message: 'Weight tracking record not found' });
    }

    // Update the user's current and goal weight if the record is approved
    if (req.body.approve) {
      const user = await User.findById(weightTracking.userId);
      if (user) {
        user.current_weight = weightTracking.currentWeight;
        user.goal_weight = weightTracking.goalWeight;
        await user.save();
      }
      weightTracking.status = 'Approved';
    } else {
      weightTracking.status = 'Rejected';
    }

    // Save the updated weight tracking record
    await weightTracking.save();

    res.json({ success: true, message: 'Weight update status changed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to change weight update status' });
  }
});