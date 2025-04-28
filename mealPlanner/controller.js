const catchAsyncError = require("../middleware/catchAsyncError");
const { uploadAndPushImage, uploadAndPushImageV2 } = require("../Common/uploadToS3");

const ErrorHander = require("../utils/errorhander");
const { Meal, UserMealRecommendation } = require("./model");
const moment = require("moment");
const { deleteS3Image } = require("../users/controller");

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

    if (!user_id || !meal_id || !meal_period || !quantity || !date) {
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

exports.userMealRecommendationFetchApp = catchAsyncError(
  async (req, res, next) => {
    // Api for to add meal : dietition
    try {
      const { type, value } = req.query;
      console.log(type, value);

      const today = new Date();
      let mealRecommdation;

      console.log(today, "this is today date");
      // date: { $gte: startOfDay, $lte: endOfDay },
      if (type == "all") {
        mealRecommdation = await UserMealRecommendation.find({
          user: req.user.id,
        }).populate({
          path: "meal",
        });
      } else if (type === "date" && value) {
        console.log(value, "this is today date");
        const startOfDay = new Date(value);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(value);
        endOfDay.setHours(23, 59, 59, 999);
        console.log("startOfDay:", startOfDay);
        console.log("endOfDay:", endOfDay);

        mealRecommdation = await UserMealRecommendation.find({
          user: req.user.id,
          date: { $gte: startOfDay, $lte: endOfDay },
        }).populate({
          path: "meal",
        });
      } else {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        mealRecommdation = await UserMealRecommendation.find({
          user: req.user.id,
          date: { $gte: startOfDay, $lte: endOfDay },
        }).populate({
          path: "meal",
        });
      }

      res.status(201).json({
        success: true,
        data: mealRecommdation,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

exports.userMealRecommendationFetch = catchAsyncError(
  async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { type, value } = req.query;
      console.log(type, value);

      const today = new Date();
      let meal_recomadation;

      console.log(today, "this is today date");
      if (!user_id) {
        return next(new ErrorHander("All field are required ", 400));
      }

      if (type === "all") {
        // console.log("All condtition triggered")
        meal_recomadation = await UserMealRecommendation.find({
          $or: [{ user: user_id }],
        }).populate({
          path: "meal",
        });
      } else if (type === "date" && value) {
        console.log(value, "this is today date");
        const startOfDay = new Date(value);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(value);
        endOfDay.setHours(23, 59, 59, 999);
        console.log("startOfDay:", startOfDay);
        console.log("endOfDay:", endOfDay);

        meal_recomadation = await UserMealRecommendation.find({
          $or: [{ user: user_id }],
          date: { $gte: startOfDay, $lte: endOfDay },
        }).populate({
          path: "meal",
        });
      } else {
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        meal_recomadation = await UserMealRecommendation.find({
          $or: [{ user: user_id }],
          date: { $gte: startOfDay, $lte: endOfDay },
        }).populate({
          path: "meal",
        });
      }

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

exports.addMeal = data = catchAsyncError(async (req, res, next) => {
  try {
    console.log("add meal function Called");
    // return "done"
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

    const meal_image_data = await uploadAndPushImageV2(
      "images/meal",
      meal_image,
      "meal_image",
      name
    );

    console.log("meal_image_data", meal_image_data);
    if (!meal_image_data.location)
      return next(new ErrorHander("Couldn't Able to upload image"));
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
    console.log("Error in addMeal:", error);
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});

exports.addMealTemplate = catchAsyncError(async (req, res, next) => {
  try {
    console.log("add meal function Called");
    const data = req.body; // Assuming the data to create the meal is in the request body
    const { name, description, ytlink1 } = data;
    // const { meal_image } = req.files;
    const formattedNutrition = JSON.parse(data.nutritions);
    const formatteRequiredIngredients = JSON.parse(data.required_ingredients);
    const formattedSteps = JSON.parse(data.steps);

    if (
      !name ||
      !description ||
      !formattedNutrition ||
      !formatteRequiredIngredients
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    const created_by = req.user._id;

    const sameMeal = await Meal.findOne({ name: name });
    if (sameMeal) {
      console.log("The Meal with the same name already exists ", sameMeal);
      return next(
        new ErrorHander("Meal with the same name already exists ", 400)
      );
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
      return next(
        new ErrorHander("Failed to save the meal to the database", 500)
      );
    }

    res.status(201).json({
      success: true,
      message: "Meal added successfully",
      data: savedMeal,
    });
  } catch (error) {
    // Handle any error that occurred during the process
    console.log("Error in addMealTemplate:", error);
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
      steps,
    } = req.body;

    const meal_image = req.files?.meal_image;

    const meal = await Meal.findById(req.params.mealId);

    if (!meal) {
      return next(new ErrorHander("Meal does not Exist", 400));
    }
    const formattedNutrition = JSON.parse(req.body.nutritions);
    const formatteRequiredIngredients = JSON.parse(
      req.body.required_ingredients
    );
    const formattedSteps = JSON.parse(req.body.steps);

    // Validate the presence of required fields
    if (
      !name ||
      !description ||
      !formattedNutrition ||
      !formatteRequiredIngredients ||
      !formattedSteps
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }

    // Assuming you have user authentication and req.user contains the user's ID
    const updated_by = req.user._id;

    const meal_image_data = await uploadAndPushImage(
      "images/meal",
      meal_image,
      "meal_image",
      name
    );
    var meal_location, meal_image_key;
    if (meal_image) {
      if (!meal_image_data.location)
        return next(new ErrorHander("updated image not upload"));
      meal_location = meal_image_data.location;
      meal_image_key = `images/meal${meal_image_data.key}`;
      console.log("image location", meal_location, meal_image_key);
    }

    // Find the meal by ID and update its fields
    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.mealId,
      {
        name,
        nutritions: formattedNutrition,
        description,
        ytlink1,
        meal_image: meal_location || meal.meal_image,
        meal_image_key: meal_image_key || meal.meal_image_key,
        required_ingredients: formatteRequiredIngredients,
        steps: formattedSteps,
        updated_by,
      },
      { new: true } // Return the updated document
    );

    if (!updatedMeal) {
      return next(new ErrorHander("Meal not found", 404));
    }
    if (meal_image) await deleteS3Image(meal.meal_image_key);
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

exports.updateMealRecommendationApp = catchAsyncError(
  async (req, res, next) => {
    try {
      console.log("update meal status called");
      const { comment, rating, user_picked, user_skip } = req.body;
      const meal_image_proof = req?.files?.meal_image_proof;

      if (!user_picked && !user_skip) {
        return next(new ErrorHander("Please Speicfy You Update Status", 400));
      }

      // Check if required fields are missing when user_completed is true
      if (user_picked && (!comment || !rating)) {
        return next(
          new ErrorHander(
            "Comment, rating, and meal  are required when marking as completed",
            400
          )
        );
      }

      // Find the meal recommendation by ID
      const mealRecommendation = await UserMealRecommendation.findById(
        req.params.recommandtionId
      );

      if (!mealRecommendation) {
        return next(new ErrorHander("Meal recommendation not found", 404));
      }

      if (user_skip) {
        // User is skipping the meal
        mealRecommendation.user_skip = true;
      } else if (user_picked) {
        // User is marking the meal as completed
        mealRecommendation.user_picked = true;
        mealRecommendation.comment = comment;
        mealRecommendation.rating = rating;

        // Upload meal image to AWS S3
        if (meal_image_proof) {
          const mealImage = await uploadAndPushImage(
            "images/feedback",
            meal_image_proof,
            "meal_image_proof",
            mealRecommendation._id // Use meal recommendation ID or any unique identifier
          );
          if (!mealImage.location) {
            console.error("Failed to upload meal image");
            return next(new ErrorHander("Failed to upload meal image", 500));
          }
          mealRecommendation.meal_image_proof = mealImage.location;
          mealRecommendation.meal_image_key = `images/feedback/${mealImage.key}`;
        }
      }

      // Save the updated meal recommendation
      await mealRecommendation.save();

      res.status(200).json({ success: true, data: mealRecommendation });
    } catch (error) {
      console.error("Error in updateMealRecommendationApp:", error);
      res.status(500).json({ error: "Failed to update meal recommendation" });
    }
  }
);
