const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const User = require("../users/model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
exports.registration = catchAsyncError(async(req,res,next) => {
    const {email,phone,first_name,last_name,password,gender,dob,weight,height,goal} = req.body
   if(!email|| !phone || first_name || last_name|| !password || !gender || !dob || !weight || !height || !goal){
    return next(new ErrorHander("All fields are required",400))
   }
    const user = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if(user){
        return next(new ErrorHander("User Already Exit",400))
    }
     let trimmedpassword = password;
      trimmedpassword = trimmedpassword.trim();
      if (trimmedpassword.length < 6) {
         return next(
           new ErrorHander(
             "password should be greater than or equal to 6 Characters",
             400
           )
         );
       }
       const salt = await bcrypt.genSalt(10);
       const hashPassword = await bcrypt.hash(trimmedpassword, salt);
       req.body.dob = new Date(dob);
       req.body.password = hashPassword;
         const doc = await User.create(req.body).then((res)=>{
            res.status(201).json({
                success:true,
                message:"User Registration successfully"
            })
         }).catch(error=>{
            return next(new ErrorHander(error,400))
         });
})