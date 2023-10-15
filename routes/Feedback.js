const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  addFeedback,
} = require("../Feedback/controller");
const router = express.Router();

router
  .route("/add-feedback")
  .post(isAuthenticated("app"), addFeedback);

module.exports = router;
