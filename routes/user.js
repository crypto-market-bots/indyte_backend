const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { registration, login, updateUserProfile, changeUserPassword, forgetPassword } = require("../users/controller");
const userOtpVerfication = require("../users/userOtpVerfication");

const router = express.Router();

router.route("/register-user",userOtpVerfication,registration);
router.route("/login-user",login);
router.route("/update-user-profile",isAuthenticated,updateUserProfile);
router.route("/change-user-password",isAuthenticated,changeUserPassword);
router.route("/forget-password",userOtpVerfication,forgetPassword)
module.exports = router;