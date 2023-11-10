const express = require('express');
const moment = require("moment");

const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  updateMyWeight,
  updateWeightStatus,
  handlingUpdateValidation,
  getWeight,
  configuringActions,
  updatingUserDetail,
  configuringRejectedActions,
  configuringApprovedActions,
  configuringEditActions,

} = require("../weightTracker/controller");

const router = express.Router();


//app 
router
  .route("/update-my-weight")
  .post(
    isAuthenticated("app"),
    updateMyWeight
  );

///Web 
router
  .route("/update-weight-status")
  .put(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    handlingUpdateValidation,
    configuringRejectedActions,
    configuringApprovedActions,
    configuringEditActions,
  );

router
  .route("/get-weights")
  .get(
    isAuthenticated("web"),
    authorizedRoles("dietitian", "admin"),
    getWeight
  );

  
// router.route("/fetch-workout").get(isAuthenticated, fetchWorkout);

module.exports = router