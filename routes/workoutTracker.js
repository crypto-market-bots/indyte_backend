const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { workout, workoutUpdate, workoutRecommendation, workoutCompleted, fetchWorkoutRecommendations, 
        fetchExercise,fetchWorkout} = require('../workoutTracker/controller');

const router = express.Router();

router.route("/new-workout").post(isAuthenticated, workout);
router.route("/workout-update/:id").put(isAuthenticated, workoutUpdate);
router.route("/new-workout-recommendation").post(isAuthenticated, workoutRecommendation);
router.route("/workout-completed").post(isAuthenticated, workoutCompleted);
router.route("/fetch-workout-recommendations/:date").get(isAuthenticated, fetchWorkoutRecommendations);
router.route("/fetch-workout").get(isAuthenticated, fetchWorkout);

module.exports = router