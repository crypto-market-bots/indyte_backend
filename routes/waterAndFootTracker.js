const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { addWaterAndFootRecom, updateWaterAndFootRecom, getWaterAndFoot} = require("../waterAndFootTracker/controller");
const router = express.Router();

router.route("/new-entry-water-or-foot").post(isAuthenticated, addWaterAndFootRecom);
router.route("/update-entry-water-or-foot/:id").put(isAuthenticated, updateWaterAndFootRecom);
router.route("/fetch-water-or-foot").post(isAuthenticated, getWaterAndFoot);

module.exports = router;