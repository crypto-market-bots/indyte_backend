const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { transporter, use } = require("../Config/email");
const sendEmail = require("../utils/sendEmail");
dotenv.config({ path: "../Config/config.env" });

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const crypto = require("crypto");
const { runInNewContext } = require("vm");
// const Seller = require("../models/sellerModel");
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
//Send the otp
exports.sendOTP = catchAsyncError(async (req, res, next) => {
  if (!req.body.phone)
    return next(new ErrorHander("Please the phone number for send the otp"));
  const phone = req.body.phone;

  const otp = Math.floor(100000 + Math.random() * 900000);
  const ttl = 2 * 60 * 1000;
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");
  const fullHash = `${hash}.${expires}`;

  client.messages
    .create({
      body: `Your One Time Login Password For Veg lover is ${otp} . Valid only for 2 minutes`,
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
