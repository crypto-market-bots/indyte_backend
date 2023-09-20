const catchAsyncError = require("../middleware/catchAsyncError");
const { uploadAndPushImage } = require("../Common/uploadToS3");

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
    const { user_id, meal_id, meal_period, quantity, date } = req.body;

    console.log(req.body);

    if (!user_id || !meal_id || !meal_period || !quantity) {
      return next(new ErrorHander("All fields are required, including", 400));
    }

    const userMealRecommendation = new UserMealRecommendation({
      user: user_id, // customer
      meal: meal_id,
      quantity: quantity,
      meal_period: meal_period,
      assigned_by: req.user.id,
      date: new Date(date),
    });

    const recommendation = await userMealRecommendation.save();
    res
      .status(201)
      .json({ success: true, message: "Success", data: recommendation });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

exports.userMealRecommendationFetchApp = catchAsyncError(async (req, res, next) => {
  // Api for to add meal : dietition
  try {
    const { assignedId } = req.params;
    const mealsRecommdation = await UserMealRecommendation.findById(assignedId).populate("meal");
    res.status(201).json({
      success: true,
      data: mealsRecommdation,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals recomdation ",error });
  }
});

exports.userMealRecommendationFetch = catchAsyncError(
  async (req, res, next) => {
    try {
      const { user_id } = req.params;

      if (!user_id) {
        return next(new ErrorHander("All field are required ", 400));
      }

      const meal_recomadation = await UserMealRecommendation.find({
        $or: [{ user: user_id }],
      }).populate("meal");
      if (meal_recomadation) {
        res.status(201).json({ success: true, data: meal_recomadation });
      } else {
        res
          .status(500)
          .json({ success: true, message: "Failed to fetch recommandtion" });
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
      const meal_recom_id = req.params.Id;
      const meal_recomadation = await UserMealRecommendation.deleteOne(
        {
          _id: meal_recom_id,
        },
        { new: true }
      );

      if (meal_recommendation.deletedCount === 1) {
        // The document was deleted successfully
        return res
          .status(200)
          .json({ success: true, message: "Deleted Successfully" });
      } else {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      // Document not found
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete user meal recommendations" });
    }
  }
);

exports.userMealRecommendationUpdate = catchAsyncError(
  async (req, res, next) => {
    try {
      const recommandtionId = req.params.Id;

      if (!user_id || !meal_id || !meal_period || !quantity) {
        return next(new ErrorHander("All fields are required, including", 400));
      }

      if (!mealRecommendationId || !updatedFields) {
        return next(
          new ErrorHander(
            "Meal recommendation ID and updated fields are required",
            400
          )
        );
      }

      // Find the existing user meal recommendation by ID
      const userMealRecommendation = await UserMealRecommendation.findById(
        recommandtionId
      );

      if (!userMealRecommendation) {
        return next(new ErrorHander("Meal recommendation not found", 404));
      }

      // Update the user meal recommendation with the provided fields
      Object.assign(userMealRecommendation, updatedFields);

      const updatedRecommendation = await userMealRecommendation.save();
      res.status(200).json({
        success: true,
        message: "Recommendation updated successfully",
        data: updatedRecommendation,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

exports.addMeal = catchAsyncError(async (req, res, next) => {
  try {
    const { name, description, ytlink1 } = req.body;
    const { meal_image } = req.files;
    const formattedNutrition = JSON.parse(req.body.nutritions);
    const formatteRequiredIngredients = JSON.parse(
      req.body.required_ingredients
    );
    const formattedSteps = JSON.parse(req.body.steps);

    if (
      !name ||
      !description ||
      !meal_image ||
      !formattedNutrition ||
      !formatteRequiredIngredients
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const created_by = req.user._id;

    const sameMeal = await Meal.findOne({ name: name });
    if (sameMeal) {
      console.log("The Meal with same name already exist ", sameMeal);
      return next(new ErrorHander("Meal with same name already exist ", 400));
    }

    const newMeal = new Meal({
      name,
      nutritions: formattedNutrition,
      description,
      ytlink1,
      required_ingredients: formatteRequiredIngredients,
      created_by,
      steps: formattedSteps, // Include the steps array
    });

    const meal_image_data = await uploadAndPushImage(
      "images/meal",
      meal_image,
      "meal_image",
      name
    );

    if (!meal_image_data.location) return next(new ErrorHander(data));
    newMeal.meal_image = meal_image_data.location;
    newMeal.meal_image_key = `images/meal${meal_image_data.key}`;
    console.log(
      "req.body.image",
      meal_image_data.location,
      meal_image_data.key
    );

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
      return res
        .status(400)
        .json({ success: false, message: "Meal ID is missing." });
    }

    const deletedMeal = await Meal.findByIdAndDelete(mealId);

    if (!deletedMeal) {
      return res
        .status(404)
        .json({ success: false, message: "Meal not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Meal delete Sucessfully" });
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

    const formattedNutrition = JSON.parse(req.body.nutritions);
    const formatteRequiredIngredients = JSON.parse(
      req.body.required_ingredients
    );
    const formattedSteps = JSON.parse(req.body.steps);

    // Validate the presence of required fields
    if (
      !name ||
      !description ||
      !image ||
      !formattedNutrition ||
      !formatteRequiredIngredients ||
      !formattedSteps
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
        nutritions: formattedNutrition,
        description,
        ytlink1,
        image,
        required_ingredients: formatteRequiredIngredients,
        steps: formattedSteps,
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
