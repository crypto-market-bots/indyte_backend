const moment = require('moment');
const catchAsyncError = require('../middleware/catchAsyncError');
const { Workout, workoutRecommendation} = require('./model');
const { Exercise } = require("../exercises/model"); // Update the path to your exercise model
const ErrorHander = require("../utils/errorhander"); // Update the path to your error handler

exports.createWorkout = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      description,
      image,
      physical_equipments,
      calorie_burn,
      exercises,
    } = req.body;


    console.log(req.body)
    // Validate the presence of required fields
    if (
      !name ||
      !description ||
      !image ||
      !physical_equipments ||
      !calorie_burn ||
      !exercises
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    // Assuming exercises is an array of exercise IDs, you can validate them as needed

    // Retrieve the exercises from the database using the provided exercise IDs
    const exerciseIds = exercises; // Update this based on how exercise IDs are sent

    const validExercises = await Exercise.find({ _id: { $in: exerciseIds } });

    if (validExercises.length !== exerciseIds.length) {
      return next(new ErrorHander("Invalid exercise IDs in exercises", 400));
    }

    // Create a new workout
    const workout = new Workout({
      name,
      description,
      image,
      physical_equipments,
      calorie_burn,
      exercises: validExercises,
      created_by: req.user.id, // Assuming user authentication and req.user contains the user's ID
    });

    // Save the workout to the database
    const savedWorkout = await workout.save();

    res.status(201).json({
      success: true,
      message: "Workout created successfully",
      data: savedWorkout,
    });
  } catch (error) {
    return next(new ErrorHander("An error occurred", 500));
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

    const workoutId = req.params.workoutId;
    console.log("this is workout id", workoutId);
    const updatedData = req.body;

    // Validate the presence of required fields
    if (
      !updatedData.name ||
      !updatedData.physical_equipments ||
      !updatedData.calorie_burn ||
      !updatedData.description||
      !updatedData.image||
      !updatedData.exercises
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    // Assuming exercises is an array of exercise IDs, you can validate them as needed
    if (updatedData.exercises) {
      const exerciseIds = updatedData.exercises;

      const validExercises = await Exercise.find({ _id: { $in: exerciseIds } });

      if (validExercises.length !== exerciseIds.length) {
        return next(new ErrorHander("Invalid exercise IDs in exercises", 400));
      }
    }

    // Find the workout by ID and update its fields
    const updatedWorkout = await Workout.findByIdAndUpdate(
      workoutId,
      updatedData,
      { new: true }
    );

    if (!updatedWorkout) {
      return next(new ErrorHander("Workout not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      data: updatedWorkout,
    });
  } catch (error) {
    return next(new ErrorHander("An error occurred", 500));
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


exports.workoutRecommendation = catchAsyncError(async(req,res, next) => {  
    const { user_id, workout_id, difficulty, schedule_time } = req.body;
    let schedule_time_formatted = moment(schedule_time, 'HH:mm DD-MM-YYYY').toDate();
    try {
        // Create a new workout recommendation object
        const recommendation = new workoutRecommendation({
            user: user_id,
            workout: workout_id,
            difficulty,
            schedule_time: schedule_time_formatted,
            created_by:req.user.id
        });

        // Save the workout recommendation to the database
        await recommendation.save();
        res.status(201).send({ success: true, message: "Success",});
    } catch (error) {
        res.status(500).send({ error: 'Failed to create workout recommendation' });
    }
});


exports.workoutCompleted = catchAsyncError(async(req,res, next) => {   // api for customer
    try {
        const { is_completed, workout_recom_id } = req.body;

        const currentDate = moment().startOf('day'); // Get the current date with time set to 00:00:00

        var workout_recom = await workoutRecommendation.findOne({
        $and: [
            { _id: workout_recom_id },
            { schedule_time: { $gte: currentDate.toDate(), $lt: currentDate.clone().endOf('day').toDate() } }
            ]
        })

        workout_recom.is_completed = is_completed;
        await workout_recom.save();
        res.status(201).json({ success: true, message: "Success",});
    } catch (error) {
        res.status(500).json({ error: 'Failed to perform the action' });
    }
});


exports.fetchExercise = catchAsyncError(async(req,res, next) => {   // api for customers and meal planner
    const {exercise_id} = req.query
    if (exercise_id) {
      Exercise.findById(exercise_id)
        .then((exercise) => {
          if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found.' });
          }
          res.status(201).json({ success: true, message: exercise});
        })
        .catch((error) => {
          res.status(500).json({ error: 'Failed to fetch exercise.' });
        });
    } else {
      Exercise.find()
        .then((exercises) => {
            res.status(201).json({ success: true, message: exercises});
        })
        .catch((error) => {
          res.status(500).json({ error: 'Failed to fetch exercises.' });
        });
    }
});


exports.fetchWorkout = catchAsyncError(async(req,res, next) => {   // api for customers and meal planner
    const workout_id = req.query.workoutId;

    if (workout_id) {
      Workout.findById(workout_id)
        .then((workout) => {
          if (!workout) {
            return res.status(404).json({ error: 'Workout not found.' });
          }
          res.status(201).json({ success: true, message: workout});
        })
        .catch((error) => {
          res.status(500).json({ error: 'Failed to fetch workout.' });
        });
    } else {
      Workout.find()
        .then((workouts) => {
            res.status(201).json({ success: true, message: workouts});
        })
        .catch((error) => {
          res.status(500).json({ error: 'Failed to fetch workout' });
        });
    }
});

exports.fetchWorkoutRecommendations = catchAsyncError(async(req,res, next) => {   // api for customers and meal planner
    const workout_recom_date = req.params.date;
    const workout_recom_date_formatted =  moment(workout_recom_date, 'DD-MM-YYYY');

    if (!workout_recom_date_formatted){
        res.status(500).json({ error: 'workout_recom_date not found.' });
    }

    workoutRecommendation.find({ $and: [
            { user : req.user.id },
            { schedule_time: { $gte: workout_recom_date_formatted.toDate(), $lt: workout_recom_date_formatted.clone().endOf('day').toDate() } }
            ]})
    .then((recommendations) => {
        res.status(201).json({ success: true, message: recommendations});
    })
    .catch((error) => {
        res.status(500).json({ error: 'Failed to fetch workout recommendations.' });
    });
});