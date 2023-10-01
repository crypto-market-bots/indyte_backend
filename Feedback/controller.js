const catchAsyncError = require("../middleware/catchAsyncError");
const { uploadAndPushImage } = require("../Common/uploadToS3");
const ErrorHander = require("../utils/errorhander");
const DietReview=require("./model");
const { Meal, UserMealRecommendation } = require("./model");
const moment = require("moment");

exports.addFeedback = catchAsyncError(async (req, res, next) => {
    try {
        const { mealRecommdatioId, comment, rating } = req.body;
        const { meal_image_proof } = req.files;

        // Check if required fields are missing
        if (!mealRecommdatioId || !rating) {
            return next(new ErrorHander("All fields are required", 400));
        }

        const newFeedback = new DietReview({
            user: req.user._id, // Assuming you have user information available in req.user
            mealRecommdatioId,
            comment: comment || null, // Set comment to an empty string if it's not provided
            rating: rating,
        });

        // Upload meal image to AWS S3
        const feedback_image_data = await uploadAndPushImage(
            "images/feedback", // Specify your S3 folder
            meal_image_proof, // Assuming meal_image_proof is an array of files
            "meal_image_proof", // Specify the image name
            mealRecommdatioId // Use meal recommendation ID or any unique identifier
        );

        if (!feedback_image_data.location) {
            console.error("Failed to upload meal image");
            return next(new ErrorHander("Failed to upload meal image", 500));
        }

        newFeedback.meal_image_proof = feedback_image_data.location;
        newFeedback.meal_image_key = `images/feedback/${feedback_image_data.key}`;
        console.log(
            "Uploaded image:",
            feedback_image_data.location,
            feedback_image_data.key
        );

        // Create a new DietReview instance
        const savedFeedback = await newFeedback.save();

        res.status(201).json({ success: true, data: savedFeedback });
    } catch (error) {
        console.error("Error in addFeedback:", error);
        res.status(500).json({ error: "Failed to add feedback" });
    }
});
