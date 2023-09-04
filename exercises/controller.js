const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const { Exercise } = require("./model");
const moment = require("moment");

exports.createExercise = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      difficulty_level,
      description,
      ytlink1,
      calorie_burn,
      repetition,
    } = req.body;

    console.log(req.body)

    const { exercise_image } = req.files;


    const steps = [
      {
        title: req.body["steps[0][title]"],
        description: req.body["steps[0][description]"],
      },
    ];
    // Validate the presence of required fields
    if (
      !name ||
      !difficulty_level ||
      !description ||
      !ytlink1 ||
      !calorie_burn ||
      !repetition ||
      !exercise_image 
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const sameExercise = await Exercise.findOne({ name: name });
    if (sameExercise) {
      console.log("Exercise With same name already exist ",sameExercise);
      return next(new ErrorHander("Exercise with same name already exist ", 400));
    }

    // Assuming you have user authentication and req.user contains the user's ID
    const created_by = req.user._id;
    console.log("Created By", created_by);
    const newExercise = new Exercise({
      name,
      difficulty_level,
      description,
      ytlink1,
      calorie_burn,
      repetition,
      exercise_image,
      steps,
      created_by,
    });

    const exercise_image_data = await uploadAndPushImage(
      "images/exercise",
      exercise_image,
      "exercise_image",
      name
    );

    if (!exercise_image_data.location) return next(new ErrorHander(data));
    newExercise.exercise_image = exercise_image_data.location;
    newExercise.exercise_image_key = `images/exercise${exercise_image_data.key}`;
    console.log(
      "req.body.image",
      exercise_image_data.location,
      exercise_image_data.key
    );

    // Save the new exercise to the database
    const savedExercise = await newExercise.save();

    if (!savedExercise) {
      return next(
        new ErrorHandler("Failed to save exercise to the database", 500)
      );
    }

    res.status(201).json({
      success: true,
      message: "Exercise added successfully",
      data: savedExercise,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});


exports.deleteExercise = catchAsyncError(async (req, res, next) => {
  const exerciseId = req.params.exerciseId; // Update the parameter name
  console.log("this is exercise id", exerciseId);
  try {
    if (!exerciseId) {
      return res
        .status(400)
        .json({ success: false, message: "Exercise ID is missing." });
    }

    const deletedExercise = await Exercise.findByIdAndDelete(exerciseId);

    if (!deletedExercise) {
      return res
        .status(404)
        .json({ success: false, message: "Exercise not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Exercise deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

exports.updateExercise = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      difficulty_level,
      description,
      ytlink1,
      calorie_burn,
      repetition,
      timetoperform,
      image,
      steps,
    } = req.body;

    // Validate the presence of required fields
    if (
      !name ||
      !difficulty_level ||
      !description ||
      !ytlink1 ||
      !calorie_burn ||
      !repetition ||
      !timetoperform ||
      !image ||
      !steps
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    // Assuming you have user authentication and req.user contains the user's ID
    const updated_by = req.user._id;

    // Find the exercise by ID and update its fields
    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.exerciseId, // Update the parameter name
      {
        name,
        difficulty_level,
        description,
        ytlink1,
        calorie_burn,
        repetition,
        timetoperform,
        image,
        steps,
        updated_by,
      },
      { new: true } // Return the updated document
    );

    if (!updatedExercise) {
      return next(new ErrorHander("Exercise not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      data: updatedExercise,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});

exports.getAllExercises = catchAsyncError(async (req, res, next) => {
  const exercises = await Exercise.find();
  res.status(200).json({
    success: true,
    message: "Exercises fetched successfully",
    data: exercises,
  });
});


exports.getExerciseById = catchAsyncError(async (req, res, next) => {
  const exerciseId = req.params.exerciseId;

  const exercise = await Exercise.findById(exerciseId);

  if (!exercise) {
    return res.status(404).json({
      success: false,
      message: "Exercise not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Exercise fetched successfully",
    data: exercise,
  });
});