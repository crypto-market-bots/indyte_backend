const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const dietitian = require("../dietitian/model");
const User = require("../users/model");
// const Seller = require("../models/sellerModel");

exports.verifyExistenceUser = catchAsyncError(async (req, res, next) => {
  const email = req.body.email;
  const phone = req.body.phone;
  var user;
  if (email && phone) return next(new ErrorHander(`enter credantials`, 400));
  else if (email && !phone) {
    user = await User.findOne({ email: email });
  } else if (!email && phone) {
    user = await User.findOne({ phone: phone });
  } else {
    user = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
  }

  if (user) {
    return next(new ErrorHander(`already exists`, 400));
  }

  next();
});

exports.isAuthenticated = (role) => catchAsyncError(async (req, res, next) => {
  console.log("called")
  const bearerHeader = req.headers["authorization"];
  console.log(role,"this is role ")
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, "DF983kjhfqn7@$@%*bjbfh12_", async (err, decodedData) => {
      if (err) {
        return next(new ErrorHander("Invalid token", 401));
      } else {
        //decodedData.userID);
        if (role=="app") {
          req.user = await User.findById(decodedData.userID);
        } else {
          req.user = await dietitian.findById(decodedData.userID);
        }
          
        // req.user = await dietitian.findById(decodedData.userID);
        if (!req.user) {
          return next(
            new ErrorHander("You are not a Valid User or seller", 400)
          );
        }
        //await Seller.findById(decodedData.userID));
        next();
        // console.log(req.body.file);
      }
    });

    // //decodedData.userID);
    // req.user = await User.findById(decodedData.userID);
    // //req.user);
    // next();
  } else {
    //"hello");
    return next(
      new ErrorHander(
        "PLease login to access this resouces . Invalid token",
        401
      )
    );
  }
});

exports.authorizedRoles = (...roles) => {
  console.log("authorized also called")
  return (req, res, next) => {
      if (!roles.includes(req.user.type)) {
        return next(
          new ErrorHander(
            `Role ${req.user.type} is not allowed to access this resource`,
          )
        );
      }
      next();
    }
  }