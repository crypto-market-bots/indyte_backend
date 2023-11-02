const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const PhysicalEquipment = require("./model");
const { uploadAndPushImage } = require("../Common/uploadToS3");

exports.AddEquipment = catchAsyncError(async (req, res, next) => {
  try {
    const { equipment_name } = req.body;

    const { equipment_image } = req.files;
    if (!equipment_name || !equipment_image) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const sameEquipment = await PhysicalEquipment.findOne({
      name: equipment_name,
    });
    if (sameEquipment) {
      console.log("Equipment With same name already exist ", sameExercise);
      return next(
        new ErrorHander("Equipment with same name already exist ", 400)
      );
    }

    // Assuming you have user authentication and req.user contains the user's ID
    const created_by = req.user._id;
    const updated_by = req.user._id;
    console.log("Created By", created_by);
    const newEquipment = new PhysicalEquipment({
      equipment_name,
      created_by,
      updated_by,
    });

    const equipment_image_data = await uploadAndPushImage(
      "images/equipment",
      equipment_image,
      "equipment_image",
      equipment_name
    );

    if (!equipment_image_data.location) return next(new ErrorHander(data));
    newEquipment.equipment_image = equipment_image_data.location;
    newEquipment.equipment_image_key = `images/equipment${equipment_image_data.key}`;
    console.log(
      "req.body.image",
      equipment_image_data.location,
      equipment_image_data.key
    );

    // Save the new exercise to the database
    const savedEquipment = await newEquipment.save();

    if (!savedEquipment) {
      return next(
        new ErrorHandler("Failed to save exercise to the database", 500)
      );
    }

    res.status(201).json({
      success: true,
      message: "Equipment added successfully",
      data: savedEquipment,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});

exports.DeleteEquipment = catchAsyncError(async (req, res, next) => {
  const equipmentId = req.params.equipmentId; // Update the parameter name
  console.log("this is exercise id", equipmentId);
  try {
    if (!equipmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Equipment ID is missing." });
    }

    const deletedEquipment = await PhysicalEquipment.findByIdAndDelete(
      equipmentId
    );

    if (!deletedEquipment) {
      return res
        .status(404)
        .json({ success: false, message: "Equipment not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Equipment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

exports.UpdateEquipment = catchAsyncError(async (req, res, next) => {
  console.log("testing");
  try {
    const { equipment_name } = req.body;
    const equipmentId = req.params.equipmentId;
    const equipment_image = req?.files?.equipment_image;
    let updatedEquipment;
    const updateData = {
      equipment_name,
      updated_by: req.user._id,
    };
    if (!equipment_name) {
      return next(new ErrorHander("All fields are required", 400));
    }

    if (!equipment_image) {
      updatedEquipment = await PhysicalEquipment.findByIdAndUpdate(
        equipmentId,
        updateData,
        { new: true } // Return the updated document
      );
    } else {
      const updated_by = req.user._id;

      const equipment_image_data = await uploadAndPushImage(
        "images/equipment",
        equipment_image,
        "equipment_image",
        equipment_name
      );

      if (!equipment_image_data.location) return next(new ErrorHander(data));
      updateData.equipment_image = equipment_image_data.location;
      updateData.equipment_image_key = `images/equipment${equipment_image_data.key}`;
      console.log("req.body.image", updateData);

      updatedEquipment = await PhysicalEquipment.findByIdAndUpdate(
        equipmentId,
        updateData,
        { new: true }
      );
    }

    // Find the exercise by ID and update its fields

    if (!updatedEquipment) {
      return next(new ErrorHander("Exercise not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      data: updatedEquipment,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});

exports.FetchAllEquipment = catchAsyncError(async (req, res, next) => {
  const exercises = await PhysicalEquipment.find();
  res.status(200).json({
    success: true,
    message: "Equipment fetched successfully",
    data: exercises,
  });
});

exports.FetchEquipment = catchAsyncError(async (req, res, next) => {
  const equipmentId = req.params.equipmentId;

  const equipment = await PhysicalEquipment.findById(equipmentId);

  if (!equipment) {
    return res.status(404).json({
      success: false,
      message: "Equipment not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Equipment fetched successfully",
    data: equipment,
  });
});
