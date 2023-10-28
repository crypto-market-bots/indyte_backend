const express = require("express");
const { sendOTP,getHistory, uploadImage } = require("../Common/controller");

const { isAuthenticated, authorizedRoles,verifyAndSendOTP } = require("../middleware/auth");


const router = express.Router();
router.route("/sendotp").post(verifyAndSendOTP,sendOTP);

router
  .route("/get-history")
  .post(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    getHistory
  );

router.route("/upload-image").post(uploadImage);
module.exports = router;
