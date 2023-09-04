const express = require('express');
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  createWorkout,
  deleteWorkout,
  updateWorkout,
  workoutRecommendation,
  workoutCompleted,
  fetchWorkoutRecommendations,
  fetchExercise,
  fetchWorkouts,
  fetchWorkout,
} = require("../workoutTracker/controller");

const router = express.Router();

router
  .route("/create-workout")
  .post(isAuthenticated('web'), authorizedRoles('dietitian', "admin"), createWorkout);

router
  .route("/delete-workout/:workoutId")
  .delete(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    deleteWorkout
  );

router
  .route("/update-workout/:workoutId")
  .put(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    updateWorkout
  );

router
  .route("/workout")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    fetchWorkouts
  );

router
  .route("/workout/:workoutId")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    fetchWorkout
  );



router.route("/new-workout-recommendation").post(isAuthenticated, workoutRecommendation);
router.route("/workout-completed").post(isAuthenticated, workoutCompleted);
router.route("/fetch-workout-recommendations/:date").get(isAuthenticated, fetchWorkoutRecommendations);
router.route("/fetch-workout").get(isAuthenticated, fetchWorkout);

module.exports = router