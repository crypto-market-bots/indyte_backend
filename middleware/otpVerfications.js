const express=require("express");
const app= express();

const dotenv=require("dotenv");
dotenv.config({path:"b/Config/config.env"})

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const crypto = require('crypto');
const catchAsyncError = require("./catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const { nextTick } = require("process");
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;



//for check the correct otp
exports.otpVerification = catchAsyncError ( async(req, res,next) => {

	let phone = req.body.phone;
	const hash = req.body.hash;
	const otp = req.body.otp;
	phone = "+91"+phone; 
	if(!(phone && hash && otp) ){
       return next(new ErrorHander("Please enter the credantials",400))
	}
	let [ hashValue, expires ] = hash.split('.');

	let now = Date.now();
	if (now > parseInt(expires)) {
		return next(new ErrorHander("Time out.",400));
	}
	let data = `${phone}.${otp}.${expires}`;
	let newCalculatedHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
	if (newCalculatedHash === hashValue) {
        next();
		
	} else {
		 return next(new ErrorHander("Incorrect Crediantals",401));
	}
});

