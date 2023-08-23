const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  allMealsFetch,
  userMealRecommendation,
  userMealRecommendationFetch,
  userMealRecommendationDelete,
  addMeal,
  deleteMeal,
  fetchMealById,
} = require("../mealPlanner/controller");
const router = express.Router();

router.route("/fetch-all-meal").get(isAuthenticated, allMealsFetch);
router.route("/fetch-meal/:id").get(isAuthenticated, fetchMealById);
router.route("/new-user-meal-recommendation").post(isAuthenticated, userMealRecommendation);
router.route("/fetch-user-meal-recommendation").get(isAuthenticated, userMealRecommendationFetch);
router.route("/delete-user-meal-recommendation").get(isAuthenticated, userMealRecommendationDelete);


router.route("/add-meal").post(isAuthenticated("web"),authorizedRoles('dietitian'),addMeal);
router
  .route("/delete-meal/:mealId")
  .delete(isAuthenticated("web"), authorizedRoles("dietitian"), deleteMeal);
// router.route("/update-meal").get(isAuthenticated('web'),authorizedRoles('dietitian'),updateMeal);

module.exports = router;