const express = require('express');
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  createWorkout,
  deleteWorkout,
  updateWorkout,
  workoutRecommendation,
  workoutCompleted,
  userWorkoutRecommendationDelete,
  fetchWorkoutRecommendations,
  userWorkoutRecommendationFetchApp,
  fetchExercise,
  userWorkoutRecommendationUpdate,
  updateWorkoutRecommendationApp,
  fetchWorkouts,
  userWorkoutRecommendationFetch,
  fetchWorkout,
  userWorkoutRecommendation,

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


//Recommdation 
  router
  .route("/new-user-workout-recommendation")
  .post(
    isAuthenticated("web"),
    authorizedRoles("dietitian","admin"),
    userWorkoutRecommendation
  );

  router
  .route("/fetch-user-workout-recommendation/:user_id")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian","admin"),
    userWorkoutRecommendationFetch
  );

  router
  .route("/update-user-workout-recommendation/:Id")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian","admin"),
    userWorkoutRecommendationUpdate
  );

  router
  .route("/delete-workout-meal-recommendation/:Id")
  .delete(
    isAuthenticated("web"),
    authorizedRoles("dietitian","admin"),
    userWorkoutRecommendationDelete
  );


  router
  .route("/get-assigned-workout")
  .get(
    isAuthenticated("app"),
    userWorkoutRecommendationFetchApp
  );

  router
  .route("/update-assigned-workout-status/:recommandtionId")
  .post(
    isAuthenticated("app"),
    updateWorkoutRecommendationApp
  );


router.route("/workout-completed/:recommandtionId").post(isAuthenticated, workoutCompleted);
// router.route("/fetch-workout").get(isAuthenticated, fetchWorkout);

module.exports = router