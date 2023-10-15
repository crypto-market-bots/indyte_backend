const express = require('express');
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  userWorkoutRecommendationFetch,
  fetchWorkout,
  userWorkoutRecommendation,

} = require("../workoutTracker/controller");

const router = express.Router();

router
  .route("/get-weight")
  .post(isAuthenticated('app'),  createWorkout);

router
  .route("/update-weight")
  .delete(
    isAuthenticated("app"),
    deleteWorkout
  );



///Web 
router
  .route("/update-workout")
  .put(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    updateWorkout
  );

router
  .route("/get-weights")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    fetchWorkouts
  );

// router.route("/fetch-workout").get(isAuthenticated, fetchWorkout);

module.exports = router