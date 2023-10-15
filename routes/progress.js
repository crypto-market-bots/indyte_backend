const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { newProgress, allProgress, updateProgress } = require("../progress/controller");
const router = express.Router();
router.route("/new-progress").post(isAuthenticated,newProgress);
router.route("/get-progress").get(isAuthenticated,allProgress);
router.route("/update-progress/:id").put(isAuthenticated,updateProgress);

module.exports = router;