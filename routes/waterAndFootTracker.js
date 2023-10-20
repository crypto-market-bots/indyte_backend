const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const {createWaterAndFoot,fetchFootAndWater, updateWaterAndFoot} = require("../waterAndFootTracker/controller");
const router = express.Router();

router.route("/new-entry-water-or-foot").post(isAuthenticated("app"), createWaterAndFoot);
router.route("/fetch-water-or-foot").post( fetchFootAndWater);
router.route("/update-water-and-foot/:id").put(isAuthenticated("app"), updateWaterAndFoot);
module.exports = router;