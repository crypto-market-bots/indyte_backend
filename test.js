const axios = require('axios');
const moment = require('moment');
const { UserMealRecommendation } = require('./mealPlanner/model');
const apiUrl = 'http://localhost:3000/createWaterAndFoot'; // Replace with your actual API endpoint

const generateAndPostData = async () => {
  try {
    if (UserMealRecommendation) {
      const value = await UserMealRecommendation.deleteOne({ meal_period: "LUNCH" }).maxTime(1000);
      console.log('Data entries for user_picked: false have been deleted successfully');
    } else {
      console.error('Error: UserMealRecommendation is undefined');
    }
  } catch (error) {
    console.error('Error posting data entry:', error);
  }
}

generateAndPostData();
