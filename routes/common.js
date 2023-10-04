const express = require("express");
const { sendOTP,getHistory } = require("../Common/controller");

const { isAuthenticated, authorizedRoles } = require("../middleware/auth");


const router = express.Router();
router.route("/sendotp").post(sendOTP);

router
  .route("/get-history")
  .post(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    getHistory
  );

module.exports = router;
