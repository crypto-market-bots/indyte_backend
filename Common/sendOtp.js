const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../users/model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
// const { transporter, use } = require("../Config/email");
// const sendEmail = require("../utils/sendEmail");
// dotenv.config({ path: "../Config/config.env" });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = require("twilio")("AC00611250c27880073ef08129ede99689", '95df8b7aa4c483d3eeab30a0a2ab7932');

const crypto = require("crypto");
const { runInNewContext } = require("vm");
// const Seller = require("../models/sellerModel");
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
//Send the otp
exports.sendOTP = catchAsyncError(async (req, res, next) => {
  if (!req.body.phone)
    return next(new ErrorHander("Please enter the phone number for send the otp"));
  const phone = "+91"+ req.body.phone;
  // phone =+phone;


  const otp = Math.floor(100000 + Math.random() * 900000);
  
  const ttl = 5 * 60 * 1000;
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");
  const fullHash = `${hash}.${expires}`;

  client.messages
    .create({
      body: `Your One Time Login Password For Indyte is ${otp} . Valid only for 2 minutes`,
      from: twilioNum,
      friendlyName: "My First Verify Service",
      to: phone,
    })
    .then((messages) => {
      res.status(200).send({ phone, hash: fullHash });
    })
    .catch((err) => {
      return next(new ErrorHander(err, 400));
    });

  // res.status(200).send({ phone, hash: fullHash, otp });
  // this bypass otp via api only for development instead hitting twilio api all the time
  // Use this way in Production
});
