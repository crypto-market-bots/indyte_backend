const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  DietitianRegistration,
  DietitianUpdation,
  fetchUser,
  fetchUserDetail,
} = require("../dietitian/controller");

const { assignDietitian } = require("../dietitian/controller");

const router = express.Router();

router
  .route("/assign-dietitian")
  .post(isAuthenticated("web"), authorizedRoles("admin"), assignDietitian);


  router
    .route("/add-dietitian")
    .post(
      isAuthenticated("web"),
      authorizedRoles("admin"),
      DietitianRegistration
    );

  router
    .route("/update-dietitian/:id")
    .post(isAuthenticated("web"), authorizedRoles("admin"), DietitianUpdation);


router
  .route("/fetch-user")
  .get(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    fetchUser
  );

router
  .route("/fetch-user")
  .get(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    fetchUser
  );

router
  .route("/fetch-user-details/:id")
  .get(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    fetchUserDetail
  );


// router.route("/get-progress").get(isAuthenticated, allProgress);
// router.route("/update-progress/:id").put(isAuthenticated, updateProgress);

module.exports = router;
