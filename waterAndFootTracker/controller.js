const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const User = require("../users/model");
const WaterAndFootTracker = require("./model");
const WaterAndFootTrackerLog = require("./model");
exports.addWaterAndFootRecom = catchAsyncError(async (req, res, next) => {
  const { water_intake, foot_steps, user, schedule_time } = req.body;
  if (!water_intake || !foot_steps || !user || !schedule_time)
    return next(new ErrorHander("All Fields are required", 400));
  const checkUser = await User.findById(user);
  if (!checkUser) return next(new ErrorHander("User Doesn't Exit", 400));
  schedule_time = moment(schedule_time, "DD-MM-YYYY").toDate();

  //here we check the user is already assigned the water and footsteps of not
  const alreadyAssinged = await WaterAndFootTracker.find({
    user: user,
    schedule_time: schedule_time,
  });
  if (alreadyAssinged)
    return next(
      new ErrorHander(
        "You Assigned the today water and foot already to this user"
      )
    );

  await WaterAndFootTracker.create({
    created_by: req.user.id,
    water_intake: water_intake,
    foot_steps: foot_steps,
    user: user,
    schedule_time: schedule_time,
  })
    .then((res) => {
      res.status(200).json({ success: true, message: "Assigned Successfully" });
    })
    .catch((err) => {
      return next(new ErrorHander(err, 400));
    });
});

exports.updateWaterAndFootRecom = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const waterAndFootTracker = await WaterAndFootTracker.find({
    _id: id,
    created_by: req.user._id,
  });
  if (!waterAndFootTracker)
    return next(new ErrorHander("Id doesn't exit with this user", 400));
  const { water_intake, foot_steps, user, schedule_time } = req.body;
  if (user) {
    const checkUser = await User.findById(user);
    if (!checkUser) return next(new ErrorHander("User Doesn't Exit", 400));
  }

  if (schedule_time)
    schedule_time = moment(schedule_time, "DD-MM-YYYY").toDate();
  await WaterAndFootTracker.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
});

//for single day only
exports.getWaterAndFoot = catchAsyncError(async (req, res, next) => {
  const { schedule_time } = re.body;
  schedule_time = moment(schedule_time, "DD-MM-YYYY").toDate();
  const WaterAndFoot = await WaterAndFootTracker.find({
    schedule_time: schedule_time,
    $or: [
      { created_by: req.user.id },
      { user: req.user.id },
      // Add more conditions as needed
    ],
  });
  res.status(200).json({success:true,data:WaterAndFoot})
});
