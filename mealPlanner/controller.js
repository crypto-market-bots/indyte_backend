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
    const { user_id, meal_id, meal_period } = req.body; 
    
    if (
      !user_id ||
      !meal_id ||
      !meal_period
      ) {
        return next(new ErrorHander("All fields are required", 400));
      }

    const userMealRecommendation = new UserMealRecommendation({
      user: user_id, // customer
      meal: meal_id,
      meal_period: meal_period,
      assigned_by: req.user.id,
    });

    const recommendation=await userMealRecommendation.save();
    res.status(201).json({ success: true, message: "Success",data:recommendation });
  } catch (error) {
    res
      .status(500)
      .json({ error: error});
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
      description,
      ytlink1,
    } = req.body;


    const {meal_image}=req.files


 const nutritions = [
   {
     type: req.body["nutritions[0][type]"],
     value: req.body["nutritions[0][value]"],
   },
   {
     type: req.body["nutritions[1][type]"],
     value: req.body["nutritions[1][value]"],
   },
 ];

 // Process required ingredients data
 const required_ingredients = [
   {
     name: req.body["required_ingredients[0][name]"],
     type: req.body["required_ingredients[0][type]"],
     quantity: req.body["required_ingredients[0][quantity]"],
   },
 ];

 // Process steps data
 const steps = [
   {
     title: req.body["steps[0][title]"],
     description: req.body["steps[0][description]"],
   },

 ];

    // Validate the presence of required fields
    console.log(req.body)

    if (
      !name ||
      !description ||
      !meal_image ||
      !nutritions ||
      !required_ingredients.length 
    ) {
      return next(new ErrorHander("All fields are required", 400));
    }


    const created_by = req.user._id;

    const sameMeal =await Meal.findOne({name:name})
    if(sameMeal){
      console.log("The Meal with same name already exist ",sameMeal)
      return next(new ErrorHander("Meal with same name already exist ", 400));
    }

    const newMeal = new Meal({
      name,
      nutritions,
      description,
      ytlink1,
      required_ingredients,
      created_by,
      steps, // Include the steps array
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
