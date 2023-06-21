const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { registration, login, updateUserProfile, changeUserPassword, forgetPassword,getUser} = require("../users/controller");
const {otpVerification} = require("../middleware/otpVerfications.js");

const router = express.Router();

router.route("/register-user").post(otpVerification,registration);
router.route("/login-user").post(login);
router.route("/update-user-profile").put(isAuthenticated,updateUserProfile);
router.route("/get-user").get(isAuthenticated,getUser);
router.route("/change-user-password").put(isAuthenticated,changeUserPassword);
router.route("/forget-password").put(otpVerification,forgetPassword);
module.exports = router;