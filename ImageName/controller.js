const { uploadAndPushImage } = require("../Common/uploadToS3");
const catchAsyncError = require("../middleware/catchAsyncError");
const ImageName = require("../ImageName/model");
const ErrorHander = require("../utils/errorhander");

exports.createImageName = catchAsyncError(async (req, res, next) => {
  const { name, type } = req.body;
  const { image } = req.files;
  if (!image || !name || !type) {
    return next(new ErrorHander("All Fields Are Required", 400));
  }

  const image_res = await uploadAndPushImage(
    `admin/imageName/${type}`,
    image,
    name,
    `${name}.${type}`
  );

  if (!image_res.location)
    return next(
      new ErrorHander("some error occured while uploading profile", 400)
    );
  req.body.image = image_res.location;
  req.body.image_key = image_res.key;

  await ImageName.create(req.body)
    .then(() => {
      res.status(200).send({
        success: true,
        message: "ImageName is created successfully",
      });
    })
    .catch((error) => {
      return next(new ErrorHander(error, 400));
    });
});

exports.getImageName = catchAsyncError(async (req, res, next) => {
  const { type } = req.query;
  if (type) {
    const data = await ImageName.find({ type: type });
    res.status(200).json({ success: true, data: data });
  } else {
    const data = await ImageName.find();
    res.status(404).json({ success: true, data: data });
  }
});

exports.updateImageName = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(
      new ErrorHander("Please Give the Id to update the ImageName")
    );
  }
  const imageName = await ImageName.findById(id);
  if (!imageName) {
    return next(new ErrorHander("Invalid Id For The Update", 400));
  }
  const { image } = req.files;
  if (image) {
    const image_res = await uploadAndPushImage(
      `admin/imageName/${imageName?.type}`,
      image,
      imageName?.name,
      `${imageName?.name}.${imageName?.type}`
    );

    if (!image_res.location)
      return next(
        new ErrorHander("some error occured while uploading profile", 400)
      );

    req.body.image = image_res.location;
    req.body.image_key = image_res.key;
  }
  const updateImageName = await ImageName.findByIdAndUpdate(
    id,
    req.body,
    { new: true } // This option returns the updated document
  );

  if (!updateImageName) {
    return next(new ErrorHander("Image Name not found", 404));
  }

  res.status(200).send({
    success: true,
    message: "ImageName details updated successfully",
    updateImageName, // You can send the upd document as a response
  });
});


exports.deleteImageName = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new ErrorHander("Please Give the Id to update the Image Name"));
  }
  try {
    const result = await ImageName.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return next(new ErrorHander("Invalid Id For The Update", 400));
    }
    
    res.status(200).json({ success: true, message: "Deleted Successfully" });
  } catch (error) {
    // Handle any errors that occur during the deletion process.
    return next(new ErrorHander("Error deleting the document", 500));
  }
});
