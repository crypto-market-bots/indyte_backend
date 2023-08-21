const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  DietitianRegistration,
} = require("../users/controller");

const router = express.Router();
router
  .route("/assign-dietitian")
  .post(isAuthenticated('web'), authorizedRoles("dietitian"),);
  router
    .route("/add-dietitian")
    .post(
      isAuthenticated("web"),
      authorizedRoles("admin"),
      DietitianRegistration
    );

// router.route("/get-progress").get(isAuthenticated, allProgress);
// router.route("/update-progress/:id").put(isAuthenticated, updateProgress);

module.exports = router;
