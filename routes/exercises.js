const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  createExercise,
  deleteExercise,
  updateExercise,
  getAllExercises,
  getExerciseById,
} = require("../exercises/controller");
const router = express.Router();

router
  .route("/add-exercise")
  .post(isAuthenticated("web"), authorizedRoles("dietitian",'admin'), createExercise);
router
  .route("/delete-exercise/:exerciseId")
  .delete(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    deleteExercise
  );
router
  .route("/update-exercise/:exerciseId")
  .put(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    updateExercise
  );
router
  .route("/exercises")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    getAllExercises
  );
router
  .route("/exercises/:exerciseId")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    getExerciseById
  );

module.exports = router;
