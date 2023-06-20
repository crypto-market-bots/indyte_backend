const ErrorHander = require("../utils/errorhander");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Seller = require("../models/sellerModel");

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

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  //"h");
  console.log("isAuthenticated");
  const bearerHeader = req.headers["authorization"];
  //bearerHeader);
  if (typeof bearerHeader !== "undefined") {
    //"hello2");
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, "DF983kjhfqn7@$@%*bjbfh12_", async (err, decodedData) => {
      if (err) {
        return next(new ErrorHander("Invalid token", 401));
      } else {
        //decodedData.userID);
        req.user = await User.findById(decodedData.userID);
        req.seller = await Seller.findById(decodedData.sellerID);
        if (!req.user && !req.seller) {
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
  return (req, res, next) => {
    //"in roles")
    //console.log("hello seller outside");
    if (req.seller) {
      console.log("hello seller seller");

      //"seller");
      if (!roles.includes(req.seller.role)) {
        return next(
          new ErrorHander(
            `Role ${req.seller.role} is not allowed to access this resource`,
            403
          )
        );
      }
      next();
    } else if (req.user) {
      //console.log("hello seller user");

      //"user");
      console.log(roles);
      console.log(req.user.role);
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHander(
            `Role ${req.user.role} is not allowed to access this resource`,
            403
          )
        );
      }
      next();
    }
  };
};
