const express = require('express');
const { sendOTP } = require('../Common/sendOtp');
const router = express.Router();
router.route("/sendotp").post(sendOTP);
module.exports = router;