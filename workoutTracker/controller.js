const moment = require("moment");
const catchAsyncError = require("../middleware/catchAsyncError");
const { Workout, workoutRecommendation } = require("./model");
const { Exercise } = require("../exercises/model");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const PhysicalEquipment = require("../equipment/model");
const ErrorHander = require("../utils/errorhander");

exports.createWorkout = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      description,
      physical_equipments,
      // physical_equipments,
      calorie_burn,
      exercises, //this was use to send array from postman (@Mohit)
    } = req.body;

    const { workout_image } = req.files;
    console.log("fjeijcrjecj", req.body);
    console.log(physical_equipments, exercises, "sssssss");
    // Validate the presence of required fields
    if (
      !name ||
      !description ||
      !workout_image ||
      !physical_equipments ||
      !calorie_burn ||
      !exercises
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const sameWorkout = await Workout.findOne({
      name: name,
    });
    if (sameWorkout) {
      console.log("workout With same name already exist ", sameWorkout);
      return next(
        new ErrorHander("workout with same name already exist ", 400)
      );
    }

    var exerciseIds = JSON.parse(exercises);
    var physical_equipmentsIds = JSON.parse(physical_equipments);

    const validExercises = [];
    for (const exerciseId of exerciseIds) {
      const exercise = await Exercise.findOne({ _id: exerciseId });
      if (exercise) {
        validExercises.push(exercise);
      }
    }

    if (validExercises.length !== exerciseIds.length) {
      return next(new ErrorHander("Invalid exercise IDs in exercises", 400));
    }

    const validEquipment = [];

    for (const equipmentId of physical_equipmentsIds) {
      const equipment = await PhysicalEquipment.findOne({ _id: equipmentId });
      if (equipment) {
        validEquipment.push(equipment);
      }
    }
    if (validEquipment.length !== physical_equipmentsIds.length) {
      return next(new ErrorHander("Invalid Equipment IDs in Equipments", 400));
    }

    console.log(" pass through validation");
    const workout = new Workout({
      name,
      description,
      physical_equipments: validEquipment,
      calorie_burn,
      exercises: validExercises,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    const workout_image_data = await uploadAndPushImage(
      "images/workout",
      workout_image,
      "workout_image",
      name
    );

    if (!workout_image_data.location) return next(new ErrorHander(data));
    workout.workout_image = workout_image_data.location;
    workout.workout_image_key = `images/workout${workout_image_data.key}`;

    // Save the workout to the database
    const savedWorkout = await workout.save();

    res.status(201).json({
      success: true,
      message: "Workout created successfully",
      data: savedWorkout,
    });
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

exports.deleteWorkout = catchAsyncError(async (req, res, next) => {
  try {
    const workoutId = req.params.workoutId;

    // Find the workout by ID and delete it
    const deletedWorkout = await Workout.findByIdAndDelete(workoutId);

    if (!deletedWorkout) {
      return next(new ErrorHandler("Workout not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("An error occurred", 500));
  }
});

exports.updateWorkout = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      description,
      physical_equipments,
      // physical_equipments,
      calorie_burn,
      exercises, //this was use to send array from postman (@Mohit)
    } = req.body;
    const workout_image = req.files?.workout_image;

    const workoutId = req.params.workoutId;
    const workout = await Workout.findById(workoutId);

    const formattedExercises = JSON.parse(req.body.exercises);
    const formattedPhysicalEquipments = JSON.parse(
      req.body.physical_equipments
    );

    let updateWorkout;
    if (
      !name ||
      !description ||
      !formattedPhysicalEquipments.length ||
      !calorie_burn ||
      !formattedExercises.length
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const updateData = {
      name,
      description,
      physical_equipments: formattedPhysicalEquipments,
      calorie_burn,
      exercises: formattedExercises,
      updated_by: req.user._id,
    };

    if (!workout_image) {
      updateWorkout = await Workout.findByIdAndUpdate(
        workoutId,
        updateData,
        { new: true } // Return the updated document
      );
    } else {
      const workout_image_data = await uploadAndPushImage(
        "images/workout",
        workout_image,
        "workout_image",
        name
      );

      if (!workout_image_data.location) return next(new ErrorHander(data));
      updateData.workout_image = workout_image_data.location;
      updateData.workout_image_key = `images/workout${workout_image_data.key}`;
      console.log("req.body.image", updateData);

      updateWorkout = await Workout.findByIdAndUpdate(workoutId, updateData, {
        new: true,
      });
    }

    if (!updateWorkout) {
      return next(new ErrorHander("workout not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "workout updated successfully",
      data: updateWorkout,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});

exports.fetchWorkouts = catchAsyncError(async (req, res, next) => {
  try {
    // Fetch all workouts from the database
    const allWorkouts = await Workout.find();

    res.status(200).json({
      success: true,
      message: "All workouts fetched successfully",
      data: allWorkouts,
    });
  } catch (error) {
    return next(new ErrorHander("An error occurred", 500));
  }
});

//Recommdation
exports.workoutRecommendation = catchAsyncError(async (req, res, next) => {
  const { user_id, workout_id, difficulty, schedule_time } = req.body;
  let schedule_time_formatted = moment(
    schedule_time,
    "HH:mm DD-MM-YYYY"
  ).toDate();
  try {
    // Create a new workout recommendation object
    const recommendation = new workoutRecommendation({
      user: user_id,
      workout: workout_id,
      difficulty,
      schedule_time: schedule_time_formatted,
      created_by: req.user.id,
    });

    // Save the workout recommendation to the database
    await recommendation.save();
    res.status(201).send({ success: true, message: "Success" });
  } catch (error) {
    res.status(500).send({ error: "Failed to create workout recommendation" });
  }
});

exports.workoutCompleted = catchAsyncError(async (req, res, next) => {
  // api for customer
  try {
    const { is_completed, workout_recom_id } = req.body;

    const currentDate = moment().startOf("day"); // Get the current date with time set to 00:00:00

    var workout_recom = await workoutRecommendation.findOne({
      $and: [
        { _id: workout_recom_id },
        {
          schedule_time: {
            $gte: currentDate.toDate(),
            $lt: currentDate.clone().endOf("day").toDate(),
          },
        },
      ],
    });

    workout_recom.is_completed = is_completed;
    await workout_recom.save();
    res.status(201).json({ success: true, message: "Success" });
  } catch (error) {
    res.status(500).json({ error: "Failed to perform the action" });
  }
});

exports.fetchExercise = catchAsyncError(async (req, res, next) => {
  // api for customers and meal planner
  const { exercise_id } = req.query;
  if (exercise_id) {
    Exercise.findById(exercise_id)
      .then((exercise) => {
        if (!exercise) {
          return res.status(404).json({ error: "Exercise not found." });
        }
        res.status(201).json({ success: true, message: exercise });
      })
      .catch((error) => {
        res.status(500).json({ error: "Failed to fetch exercise." });
      });
  } else {
    Exercise.find()
      .then((exercises) => {
        res.status(201).json({ success: true, message: exercises });
      })
      .catch((error) => {
        res.status(500).json({ error: "Failed to fetch exercises." });
      });
  }
});

exports.fetchWorkout = catchAsyncError(async (req, res, next) => {
  // api for customers and meal planner
  console.log("called fetchworkout");
  const workoutRecommendationId = req.params.workoutId;

  if (workoutRecommendationId) {
    Workout.findById(workoutRecommendationId)
      .then((workout) => {
        if (!workout) {
          return res.status(404).json({ error: "Workout not found." });
        }
        res.status(201).json({ success: true, message: workout });
      })
      .catch((error) => {
        res.status(500).json({ error: "Failed to fetch workout." });
      });
  } else {
    Workout.find()
      .then((workouts) => {
        res.status(201).json({ success: true, message: workouts });
      })
      .catch((error) => {
        res.status(500).json({ error: "Failed to fetch workout" });
      });
  }
});

exports.fetchWorkoutRecommendations = catchAsyncError(
  async (req, res, next) => {
    // api for customers and meal planner
    const workout_recom_date = req.params.date;
    const workout_recom_date_formatted = moment(
      workout_recom_date,
      "DD-MM-YYYY"
    );

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
  }
);

exports.userWorkoutRecommendation = catchAsyncError(async (req, res, next) => {
  // Api for to add meal : dietition

  try {
    const { user_id, workout_id, difficulty, date } = req.body;

    console.log(req.body);

    if (!user_id || !workout_id || !difficulty || !date) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const userworkoutRecommendation = new workoutRecommendation({
      user: user_id, // customer
      workout_id: workout_id,
      difficulty: difficulty,
      assigned_by: req.user.id,
      date: new Date(date),
    });

    const recommendation = await userworkoutRecommendation.save();
    res
      .status(201)
      .json({ success: true, message: "Success", data: recommendation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.userWorkoutRecommendationFetchApp = catchAsyncError(
  async (req, res, next) => {
    // Api for to add meal : dietition
    try {
      const { type, value } = req.query;
      console.log(type, value);

      const today = new Date();
      let workoutRecommdation;

      console.log(today, "this is today date");
      // date: { $gte: startOfDay, $lte: endOfDay },
      if (type == "all") {
        workoutRecommdation = await workoutRecommendation
          .find({
            user: req.user.id,
          })
          .populate({
            path: "workout_id",
            populate: {
              path: "exercises",
            },
          });
      } else if (type === "date" && value) {
        console.log(value, "this is today date");
        const startOfDay = new Date(value);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(value);
        endOfDay.setHours(23, 59, 59, 999);
        console.log("startOfDay:", startOfDay);
        console.log("endOfDay:", endOfDay);

        workoutRecommdation = await workoutRecommendation
          .find({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
          })
          .populate({
            path: "workout_id",
            populate: {
              path: "exercises",
            },
          });
      } else {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        workoutRecommdation = await workoutRecommendation
          .find({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
          })
          .populate({
            path: "workout_id",
            populate: {
              path: "exercises",
            },
          });
      }

      res.status(201).json({
        success: true,
        data: workoutRecommdation,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

exports.userWorkoutRecommendationFetch = catchAsyncError(
  async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { type, value } = req.query;

      const today = new Date();
      let workout_recomadation;

      if (!user_id) {
        return next(new ErrorHander("All fields are required", 400));
      }

      if (type == "all") {
        workout_recomadation = await workoutRecommendation
          .find({ $or: [{ user: user_id }] })
          .populate({
            path: "workout_id",
          });
      } else if (type === "date" && value) {
        const startOfDay = new Date(value);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(value);
        endOfDay.setHours(23, 59, 59, 999);

        workout_recomadation = await workoutRecommendation
          .find({
            $or: [{ user: user_id }],
            date: { $gte: startOfDay, $lte: endOfDay },
          })
          .populate({
            path: "workout_id",
          });
      } else {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        workout_recomadation = await workoutRecommendation
          .find({
            $or: [{ user: user_id }],
            date: { $gte: startOfDay, $lte: endOfDay },
          })
          .populate({
            path: "workout_id",
          });
      }

      if (workout_recomadation) {
        res.status(201).json({ success: true, data: workout_recomadation });
      } else {
        res
          .status(500)
          .json({ success: true, message: "Failed to fetch recommendation" });
      }
    } catch (error) {
      console.log("error", error);
      res
        .status(500)
        .json({ error: "Failed to fetch user meal recommendations" });
    }
  }
);

exports.userWorkoutRecommendationDelete = catchAsyncError(
  async (req, res, next) => {
    try {
      const workout_recom_id = req.params.Id;
      const workout_recomadation = await workoutRecommendation.deleteOne(
        {
          _id: workout_recom_id,
        },
        { new: true }
      );

      if (workout_recomadation.deletedCount === 1) {
        // The document was deleted successfully
        return res
          .status(200)
          .json({ success: true, message: "Deleted Successfully" });
      } else {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      // Document not found
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete user meal recommendations" });
    }
  }
);

exports.userWorkoutRecommendationUpdate = catchAsyncError(
  async (req, res, next) => {
    try {
      const recommendationId = req.params.Id; // Correct variable name to recommendationId
      const { user_id, workout_id, difficulty, date } = req.body;

      if (!user_id || !workout_id || !difficulty || !date) {
        return next(new ErrorHander("All fields are required", 400));
      }

      // Find and update the existing user workout recommendation by ID
      const updatedRecommendation =
        await workoutRecommendation.findByIdAndUpdate(
          recommendationId,
          {
            user_id,
            workout_id,
            difficulty,
            date,
          },
          { new: true, runValidators: true }
        );

      if (!updatedRecommendation) {
        return next(new ErrorHander("Workout recommendation not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Recommendation updated successfully",
        data: updatedRecommendation,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

exports.updateWorkoutRecommendationApp = catchAsyncError(
  async (req, res, next) => {
    try {
      console.log("update meal status called");
      const { user_picked, user_skip } = req.body;

      if (!user_picked && !user_skip) {
        return next(new ErrorHander("Please Specify Your Update Status", 400));
      }

      // Check if both user_skip and user_picked are either both true or both false
      if ((user_skip && user_picked) || (!user_skip && !user_picked)) {
        return next(
          new ErrorHander("Please Specify Workout is completed or Skipped", 400)
        );
      }

      // Find the workout recommendation by ID
      const workoutRecommendationdata = await workoutRecommendation.findById(
        req.params.recommandtionId
      );

      if (!workoutRecommendationdata) {
        return next(new ErrorHander("Workout recommendation not found", 404));
      }

      if (
        workoutRecommendationdata.user_picked ||
        workoutRecommendationdata.user_skip
      ) {
        return next(new ErrorHander("Workout Status already Updated ", 404));
      }

      if (user_skip) {
        // User is skipping the workout
        workoutRecommendationdata.user_skip = true;
      } else if (user_picked) {
        // User is marking the workout as completed
        workoutRecommendationdata.user_picked = true;
      }

      // Save the updated workout recommendation
      await workoutRecommendationdata.save();

      res.status(200).json({ success: true, data: workoutRecommendationdata });
    } catch (error) {
      console.error("Error in updateWorkoutRecommendationApp:", error);
      res
        .status(500)
        .json({ error: "Failed to update workout recommendation" });
    }
  }
);
