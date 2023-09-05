const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  UserRegistration,
  login,
  updateUserProfile,
  changeUserPassword,
  forgetPassword,
  getUser,
  deleteS3Image,
  fetchUser,
} = require("../users/controller");
const { otpVerification } = require("../middleware/otpVerfications.js");

const router = express.Router();
router.route("/register-user").post(UserRegistration);
router.route("/login").post(login);
// router.route("/login-admin").post(loginAdmin);
router.route("/update-user-profile").put(isAuthenticated, updateUserProfile);

router.route("/get-user-detail").get(isAuthenticated("web"), getUser);

router.route("/delete-s3-image/:key").get(deleteS3Image);

router
  .route("/change-user-password")
  .put(isAuthenticated("web"), changeUserPassword);
router.route("/forget-password").put(otpVerification, forgetPassword);

module.exports = router;
