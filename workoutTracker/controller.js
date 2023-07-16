const catchAsyncError = require('../middleware/catchAsyncError');
const {Exercise, Workout, WorkoutRecommendation} = require('./model');


exports.exercise = catchAsyncError(async(req,res, next) => {  // post method for dietion and owner for to crate the excersise
    // Create Exercise Record
    try {
        const {name, difficulty, burn_calories, repetition, steps, video_link} = req.body;
        const exercise = new Exercise({
            name,
            difficulty,
            burn_calories,
            repetition,
            steps,
            video_link,
            created_by:req.user.id
        });
        const savedExcersie =  await exercise.save();
        
        res.status(201).json({
            success: true,
            message: "Success",
            exercise_id : savedExcersie._id,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }    
});

exports.workout = catchAsyncError(async(req,res, next) => {  
    try {
        const { name, difficulty, physical_equipments, sets } = req.body;

        // Create an array to store the exercises
        const exercises = [];

        // Loop through each set in the sets object
        for (const setNumber in sets) {
        if (Object.hasOwnProperty.call(sets, setNumber)) {
            const set = sets[setNumber];

            // Loop through each exercise in the set
            for (const exerciseNumber in set) {
            if (Object.hasOwnProperty.call(set, exerciseNumber)) {
                const exerciseId = set[exerciseNumber];

                // Retrieve the exercise from the database using the provided exerciseId
                var exercise = await Exercise.findById(exerciseId);
                
                // Add the exercise to the exercises array
                if (exercise) {
                    exercise.set_number = setNumber;
                    await exercise.save()
                    exercises.push(exercise);
                }
            }
            }
        }
        }

        // Create a new workout
        const workout = new Workout({
        name,
        difficulty,
        physical_equipments,
        exercises,
        });

        // Save the workout to the database
        await workout.save();
        res.status(201).json(workout);
  } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
  }
});

exports.workoutUpdate = catchAsyncError(async(req,res, next) => {  
    try {
        const workoutId = req.params.id;
        const { name, difficulty, physical_equipments, sets } = req.body;

        // Find the workout by ID
        var workout = await Workout.findById(workoutId);

        if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
        }

        // Update the workout fields
        if (name){
            workout.name = name;
        }
        if (difficulty){
            workout.difficulty = difficulty;
        }
        if (physical_equipments){
            workout.physical_equipments = physical_equipments;
        }

        const update_add_sets = sets.update;
        const delete_sets = sets.delete;

        if (update_add_sets) {
            for (let i = 0; i < update_add_sets.length; i++) {
                const exercise_obj= update_add_sets[i];
                const exercise_id = Object.keys(exercise_obj)[0];
                const set_number = exerciseObj[exercise_id];
                var exercise = await Exercise.findById(exerciseId);
                exercise.set_number = set_number;
                exercise.save()
                workout.exercise.push(exercise_id);
              }              
        }
        if (delete_sets) {
            for (let i = 0; i < delete_sets.length; i++) {
                const exercise_id = delete_sets[i];
                workout.exercise.pull(exerciseId);
            }
        }
        await workout.save();
        res.status(201).json({ success: true, message: "Success",});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed workout update !' });
    }
});

exports.workoutRecommendation = catchAsyncError(async(req,res, next) => {  
    try {
        const { user_id, workout_id, difficulty, schedule_time } = req.body;

        schedule_time_formatted = moment(schedule_time, 'HH:mm DD-MM-YYYY').toDate();
        // Create a new workout recommendation object
        const recommendation = new WorkoutRecommendation({
            user_id,
            workout_id,
            difficulty,
            schedule_time_formatted,
            created_by
        });

        // Save the workout recommendation to the database
        const savedRecommendation = await recommendation.save();

        res.status(201).json({ success: true, message: "Success",});
    } catch (error) {
        res.status(500).json({ error: 'Failed to create workout recommendation' });
    }
});


exports.workoutCompleted = catchAsyncError(async(req,res, next) => {   // api for customer
    try {
        const { is_completed, workout_recom_id } = req.params;

        const currentDate = moment().startOf('day'); // Get the current date with time set to 00:00:00

        var workout_recom = await WorkoutRecommendation.findOne({
        $and: [
            { _id: workout_recom_id },
            { schedule_time: { $gte: currentDate.toDate(), $lt: currentDate.clone().endOf('day').toDate() } }
            ]
        })

        workout_recom.is_completed=is_completed;
        await workout_recom.save();


        res.status(201).json({ success: true, message: "Success",});
    } catch (error) {
        res.status(500).json({ error: 'Failed to perform the action' });
    }
});


exports.fetchExercise = catchAsyncError(async(req,res, next) => {   // api for customers and meal planner
    const exercise_id = req.params.exercise_id;
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
    const workout_id = req.params.workout_id;

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
          res.status(500).json({ error: 'Failed to fetch workouts.' });
        });
    }
});

exports.fetchWorkoutRecommendations = catchAsyncError(async(req,res, next) => {   // api for customers and meal planner
    const workout_recom_date = req.params.workout_recom_date;
    const workout_recom_date_formatted =  moment(workout_recom_date, 'DD-MM-YYYY').toDate();

    if (!workout_recom_date_formatted){
        res.status(500).json({ error: 'workout_recom_date not found.' });
    }

    WorkoutRecommendation.find({ $and: [
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