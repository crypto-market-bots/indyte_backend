const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const { Meal, UserMealRecommendation } = require("./model");
const moment = require("moment");

exports.allMealsFetch = catchAsyncError(async (req, res, next) => {
  try {
    const meals = await Meal.find();
    res.status(201).json({
      success: true,
      data: meals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

exports.fetchMealById = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;
    const meals = await Meal.findById(id);
    res.status(201).json({
      success: true,
      data: meals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

exports.userMealRecommendation = catchAsyncError(async (req, res, next) => {
  // Api for to add meal : dietition

  try {
    var { user_id, meal_id, meal_time, meal_period } = req.body; // meal_time : DD-MM-YYYY

    if (!meal_id) {
      const {
        meal_name,
        nutritions,
        description,
        image_link,
        required_ingredients,
        steps,
      } = req.body;
      const meal = new Meal({
        meal_image: image,
        name: meal_name,
        nutritions: nutritions,
        description: description,
        image: image_link,
        required_ingredients: required_ingredients,
        steps: steps,
        created_by: req.user.id,
      });
      const savedMeal = await meal.save();
      meal_id = savedMeal._id;
    }

    const meal_time_formatted = moment(meal_time, "DD-MM-YYYY").toDate(); // Date
    const userMealRecommendation = new UserMealRecommendation({
      user: user_id, // customer
      meal: meal_id,
      meal_time: meal_time_formatted,
      meal_period: meal_period,
      added_by: req.user.id,
    });

    await userMealRecommendation.save();
    res.status(201).json({ success: true, message: "Success" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create user meal recommendation" });
  }
});

exports.userMealRecommendationFetch = catchAsyncError(
  async (req, res, next) => {
    try {
      if (req.query.meal_id) {
        const meal = await Meal.findById(req.query.meal_id);
        res.status(201).json({ success: true, data: meal });
      } else {
        const mealLogs = await UserMealRecommendation.find()
          .populate("user", "name")
          .populate("meal", "name");
        res.status(201).json({ success: true, data: mealLogs });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch user meal recommendations" });
    }
  }
);

exports.userMealRecommendationDelete = catchAsyncError(
  async (req, res, next) => {
    try {
      const meal_recom_id = req.query.meal_recom_id;
      const meal = await UserMealRecommendation.deleteOne({
        _id: meal_recom_id,
      });
      res.status(201).json({ success: true, message: "Success" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete user meal recommendations" });
    }
  }
);


exports.addMeal = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      nutritions,
      description,
      ytlink1,
      required_ingredients,
      image,
      steps,
    } = req.body;

    // Validate the presence of required fields
    if (
      !name ||
      !description ||
      !image ||
      !nutritions ||
      !required_ingredients.length // Check the length of the array
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }


    // Assuming you have user authentication and req.user contains the user's ID
    const created_by = req.user._id;

    const newMeal = new Meal({
      name,
      nutritions,
      description,
      ytlink1,
      image,
      required_ingredients,
      created_by,
      steps, // Include the steps array
    });

    // Save the new meal to the database
    const savedMeal = await newMeal.save();

    if (!savedMeal) {
      return next(new ErrorHander("Failed to save meal to the database", 500));
    }

    res.status(201).json({
      success: true,
      message: "Meal added successfully",
      data: savedMeal,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});



exports.deleteMeal = catchAsyncError(async (req, res, next) => {
  const mealId = req.params.mealId;

  try {
    if (!mealId) {
      return res.status(400).json({ success: false, message: "Meal ID is missing." });
    }

    const deletedMeal = await Meal.findByIdAndDelete(mealId);

    if (!deletedMeal) {
      return res.status(404).json({ success: false, message: "Meal not found." });
    }
    return res.status(200).json({ success: true, message: "Meal delete Sucessfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

});


exports.updateMeal = catchAsyncError(async (req, res, next) => {
  try {
    const {
      name,
      nutritions,
      description,
      ytlink1,
      required_ingredients,
      image,
      steps,
    } = req.body;

    // Validate the presence of required fields
    if (
      !name ||
      !description ||
      !image ||
      !nutritions ||
      !required_ingredients ||
      !steps
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    // Assuming you have user authentication and req.user contains the user's ID
    const updated_by = req.user._id;

    // Find the meal by ID and update its fields
    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.mealId,
      {
        name,
        nutritions,
        description,
        ytlink1,
        image,
        required_ingredients,
        steps,
        updated_by,
      },
      { new: true } // Return the updated document
    );

    if (!updatedMeal) {
      return next(new ErrorHander("Meal not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      data: updatedMeal,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});
