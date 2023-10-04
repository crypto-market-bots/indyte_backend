const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  updateWeight,
  approveWeight,
  getWeightsByUserId,
  getWeightsApp,
  getWeights,
} = require("../weightTracker/controller");

const router = express.Router();





router.route("/update-weight").post(isAuthenticated("app"), updateWeight); //tested

  //for app
router.get('/get-weights', isAuthenticated('app'), getWeightsByUserId); //tested


router.get('/get-weight-history', isAuthenticated('app'), getWeightsApp); //Tested




///Web

router
  .route('/approve-weight/:id')
  .put(
    isAuthenticated('web'),
    authorizedRoles('dietitian', 'admin'),
    approveWeight
  );

router
  .route("/get-weights/:userId")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    getWeights
  );

// router.route("/fetch-workout").get(isAuthenticated, fetchWorkout);

module.exports = router;
