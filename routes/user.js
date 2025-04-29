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
  sendOTPForLogin,
  verifyOtpforLogin,
  loginUser,
} = require("../users/controller");
const { otpVerification } = require("../middleware/otpVerfications.js");

const router = express.Router();
router.route("/register-user").post(isAuthenticated("web"),UserRegistration);

router.route("/create-user").post(otpVerification,UserRegistration);

// router.route("/register-user").post(otpVerification('LOGIN'));
router.route("/login").post(login);
router.route("/login-user").post(loginUser);

router.route("/update-user-profile").put(isAuthenticated("app"), updateUserProfile);

router.route("/get-user-detail").get(isAuthenticated("app"), getUser);

router.route("/get-detail").get(isAuthenticated("web"), getUser);

router.route("/delete-s3-image").delete(deleteS3Image);
router.route("/send-otp-for-login").post(sendOTPForLogin);
router.route("/verify-otp-for-login").post(verifyOtpforLogin);

router
  .route("/change-user-password")
  .put(isAuthenticated("web"), changeUserPassword);
router.route("/forget-password").put(otpVerification, forgetPassword);

module.exports = router;
