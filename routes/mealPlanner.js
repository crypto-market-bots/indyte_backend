const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  allMealsFetch,
  userMealRecommendation,
  userMealRecommendationFetch,
  userMealRecommendationDelete,
  addMeal,
  updateMeal,
  deleteMeal,
  fetchMealById,
} = require("../mealPlanner/controller");
const router = express.Router();

router.route("/new-user-meal-recommendation").post(isAuthenticated, userMealRecommendation);
router.route("/fetch-user-meal-recommendation").get(isAuthenticated, userMealRecommendationFetch);
router.route("/delete-user-meal-recommendation").get(isAuthenticated, userMealRecommendationDelete);


router.route("/add-meal").post(isAuthenticated("web"),authorizedRoles('dietitian'),addMeal);
router
.route("/delete-meal/:mealId")
.delete(isAuthenticated("web"), authorizedRoles("dietitian"), deleteMeal);
router
.route("/update-meal/:mealId")
.put(isAuthenticated("web"), authorizedRoles("dietitian"), updateMeal);

router
  .route("/meals")
  .get(isAuthenticated("web"), authorizedRoles("dietitian"), allMealsFetch);
router
  .route("/meals/:id")
  .get(isAuthenticated("web"), authorizedRoles("dietitian"), fetchMealById);

module.exports = router;