const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const { WaterAndFootTracker } = require("../waterAndFootTracker/model");

exports.createWaterAndFoot = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { type, value } = req.body;
  if (!type || !value) {
    return next(new ErrorHander("Type and Value  is Required"));
  }

  const created_Date = new Date().toISOString().split("T")[0];

  // Check if there is existing data with the same user, type, and date
  const existingData = await WaterAndFootTracker.findOne({
    user: user._id,
    type: type,
    created_Date: created_Date,
  });

  if (existingData) {
    return next(
      new ErrorHander(
        `Today data already exits for the ${type} with this value ${existingData?.value}`
      )
    );
  }

  // Create a new record if no existing data is found
  const newData = new WaterAndFootTracker({
    value,
    type,
    user: user._id,
    created_Date: created_Date,
  });

  await newData.save();

  res.status(201).json({ message: "Data created successfully", data: newData });
});

exports.fetchFootAndWater = catchAsyncError(async (req, res, next) => {
  console.log(":nf");
  const { type, interval, userId } = req.body;
  if (!type || !userId || !interval)
    return next(new ErrorHander("type userId interval is mandatory"));
  let startDate;
  const endDate = new Date();

  switch (interval) {
    case "today":
      startDate = new Date();
      break;
    case "week":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      return next(new ErrorHander("Invalid Time peroid"));
  }

  const query = {
    user: userId,
    type,
    created_Date: {
      $gte: startDate.toISOString().split("T")[0],
      $lte: endDate.toISOString().split("T")[0],
    },
  };

  try {
    const data = await WaterAndFootTracker.find(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    return next(new ErrorHander(error, 400));
  }
});

exports.updateWaterAndFoot = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const data = await WaterAndFootTracker.findById(id);
  if (!data) return next(new ErrorHander("data not found"));
  console.log(data,req.user._id);
  if (req.user._id.toString() != data.user.toString()){
    return next(
      new ErrorHander("Failed: You don;t have permission to update", 400)
    );
  }
  if ("created_date" in req.body) {
    // Remove the created_date from req.body if it exists
    delete req.body.created_date;
  }
  const updateData = await WaterAndFootTracker.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updateData)
    return next(new ErrorHander("Faild: Data is Not Updated", 400));
  else {
    res.status(200).json({ success: true, updateData });
  }
});
