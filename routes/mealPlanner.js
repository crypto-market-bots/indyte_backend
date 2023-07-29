const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { allMealsFetch, userMealRecommendation, userMealRecommendationFetch, userMealRecommendationDelete, 
    userMealRecommendationAdded, fetchMealById } = require("../mealPlanner/controller");
const router = express.Router();

router.route("/fetch-all-meal").get(isAuthenticated, allMealsFetch);
router.route("/fetch-meal/:id").get(isAuthenticated, fetchMealById);
router.route("/new-user-meal-recommendation").post(isAuthenticated, userMealRecommendation);
router.route("/fetch-user-meal-recommendation").get(isAuthenticated, userMealRecommendationFetch);
router.route("/delete-user-meal-recommendation").get(isAuthenticated, userMealRecommendationDelete);
router.route("/add-user-meal-recommendation").get(isAuthenticated, userMealRecommendationAdded);

module.exports = router;