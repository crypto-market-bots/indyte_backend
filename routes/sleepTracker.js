const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { sleepSchedule, sleepScheduleDashboard } = require('../sleepTracker/controller');
const router = express.Router();
router.route("/new-schedule").post(isAuthenticated,sleepSchedule);
router.route("/fetch-schedule").get(isAuthenticated,sleepScheduleFetch);
router.route("/fetch-schedule-dashboard").get(isAuthenticated,sleepScheduleDashboard);
module.exports = router