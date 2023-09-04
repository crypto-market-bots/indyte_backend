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

//these are api For recommendation

router.route("/new-user-meal-recommendation").post(isAuthenticated("web"),authorizedRoles("dietitian"), userMealRecommendation);
router.route("/fetch-user-meal-recommendation").get(isAuthenticated("web"),authorizedRoles("dietitian"), userMealRecommendationFetch);
router.route("/delete-user-meal-recommendation").get(isAuthenticated("web"),authorizedRoles("dietitian"), userMealRecommendationDelete);



//These are api for handling meal Template

router.route("/add-meal").post(isAuthenticated("web"),authorizedRoles('dietitian','admin'),addMeal);
router
.route("/delete-meal/:mealId")
.delete(isAuthenticated("web"), authorizedRoles("dietitian",'admin'), deleteMeal);
router
.route("/update-meal/:mealId")
.put(isAuthenticated("web"), authorizedRoles("dietitian",'admin'), updateMeal);

router
  .route("/meals")
  .get(isAuthenticated("web"), authorizedRoles("dietitian",'admin'), allMealsFetch);
router
  .route("/meals/:id")
  .get(isAuthenticated("web"), authorizedRoles("dietitian",'admin'), fetchMealById);

module.exports = router;