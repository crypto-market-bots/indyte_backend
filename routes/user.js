const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  UserRegistration,
  login,
  updateUserProfile,
  changeUserPassword,
  forgetPassword,
  getUser,
  fetchUser,
} = require("../users/controller");
const {otpVerification} = require("../middleware/otpVerfications.js");

const router = express.Router();
router.route("/register-user").post(otpVerification, UserRegistration);
router.route("/login").post(login);
// router.route("/login-admin").post(loginAdmin);
router.route("/update-user-profile").put(isAuthenticated, updateUserProfile);

router.route("/get-user-detail").get(isAuthenticated('app'),getUser);


router
  .route("/change-user-password")
  .put(isAuthenticated("web"), changeUserPassword);
router.route("/forget-password").put(otpVerification,forgetPassword);




module.exports = router;