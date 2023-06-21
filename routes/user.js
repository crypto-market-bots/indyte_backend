const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { registration, login, updateUserProfile, changeUserPassword, forgetPassword } = require("../users/controller");
const userOtpVerfication = require("../middleware/otpVerfications");

const router = express.Router();

router.route("/register-user").post(userOtpVerfication,registration);
router.route("/login-user").post(login);
router.route("/update-user-profile").put(isAuthenticated,updateUserProfile);
router.route("/change-user-password").put(isAuthenticated,changeUserPassword);
router.route("/forget-password").put(userOtpVerfication,forgetPassword);
module.exports = router;