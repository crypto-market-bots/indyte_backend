const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {
  AddEquipment,
  DeleteEquipment,
  UpdateEquipment,
  FetchAllEquipment,
  FetchEquipment,
} = require("../equipment/controller");

const router = express.Router();

router
  .route("/add-equipment")
  .post(isAuthenticated("web"), authorizedRoles("admin"), AddEquipment);

router
  .route("/delete-equipment")
  .delete(isAuthenticated("web"), authorizedRoles("admin"), DeleteEquipment);

router
  .route("/update-equipment")
  .put(isAuthenticated("web"), authorizedRoles("admin"), UpdateEquipment);

router
  .route("/equipment")
  .get(isAuthenticated("web"), authorizedRoles("admin"), FetchAllEquipment);

router
  .route("/equipment")
  .get(isAuthenticated("web"), authorizedRoles("admin"), FetchEquipment);




module.exports = router;
