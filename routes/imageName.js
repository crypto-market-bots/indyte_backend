const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  createImageName,
  updateImageName,
  deleteImageName,
  getImageName,
} = require("../ImageName/controller");
const router = express.Router();
router
  .route("/create-image-name")
  .post(isAuthenticated("web"), authorizedRoles("admin"), createImageName);
router
  .route("/update-image-name/:id")
  .put(isAuthenticated("web"), authorizedRoles("admin"), updateImageName);
router
  .route("/delete-image-name/:id")
  .delete(isAuthenticated("web"), authorizedRoles("admin"), deleteImageName);
router
  .route("/get-image-name")
  .get(getImageName);

  module.exports = router;