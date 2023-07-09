const catchAsyncError = require('../middleware/catchAsyncError');
const {Meal, UserMealRecommendation} = require('./model');
const moment = require("moment")

exports.allMealsFetch = catchAsyncError(async(req,res, next) => {
 try {
    const meals = await Meal.find();
    res.status(201).json({
        success: true,
        data:meals,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

exports.userMealRecommendation = catchAsyncError(async(req,res, next) => {  // Api for to add meal : dietition
    console.log(req.body)
    try {
        var { user_id, meal_id, meal_time, meal_period} = req.body; // meal_time : DD-MM-YYYY
        if (!meal_id) {
            const { meal_name, nutritions, description, image_link, required_ingredients, steps} = req.body;
            const meal = new Meal({
                name:meal_name,
                nutritions:nutritions,
                description:description,
                image:image_link,
                required_ingredients:required_ingredients,
                steps:steps,
                created_by:req.user.id
            });
            const savedMeal = await meal.save();
            meal_id = savedMeal._id;
        }

        const meal_time_formatted =  moment(meal_time, 'DD-MM-YYYY').toDate();// Date
        const userMealRecommendation = new UserMealRecommendation({
            user:user_id, // customer 
            meal:meal_id,
            meal_time : meal_time_formatted,
            meal_period: meal_period,
            added_by:req.user.id
        });
    
        await userMealRecommendation.save();
        res.status(201).json({success: true,message: "Success"});
      } catch (error) {
        console.log("err",error)
        res.status(500).json({ error: 'Failed to create user meal recommendation' });
      }
});

exports.userMealRecommendationFetch = catchAsyncError(async(req,res, next) => {
    try {
        if (req.query.meal_id) {
            const meal = await Meal.findById(req.query.meal_id);
            res.status(201).json({success: true, data:meal});
        } else {
            const mealLogs = await UserMealRecommendation.find().populate('user', 'name').populate('meal', 'name');
            res.status(201).json({success: true, data:mealLogs});
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user meal recommendations' });
    }
});

exports.userMealRecommendationDelete = catchAsyncError(async(req,res, next) => {
    try {
        const meal_recom_id = req.query.meal_recom_id;
        const meal = await UserMealRecommendation.deleteOne({ _id: meal_recom_id })
        res.status(201).json({success: true,message: "Success"});
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user meal recommendations' });
    }
});

exports.userMealRecommendationAdded = catchAsyncError(async(req,res, next) => {
    try {
        const meal_recom_id = req.query.meal_recom_id;
        var user_meal_obj = await UserMealRecommendation.findById(meal_recom_id);
        user_meal_obj.user_picked = true;
        user_meal_obj.save()
        res.status(201).json({success: true,message: "Success"});
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong in the API' });
    }
});