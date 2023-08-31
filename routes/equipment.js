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
  .post(isAuthenticated("web"), authorizedRoles("admin",'dietitian'), AddEquipment);

router
  .route("/delete-equipment/:equipmentId")
  .delete(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    DeleteEquipment
  );

router
  .route("/update-equipment/:equipmentId")
  .put(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    UpdateEquipment
  );

router
  .route("/equipment")
  .get(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    FetchAllEquipment
  );

router
  .route("/equipment/:equipmentId")
  .get(
    isAuthenticated("web"),
    authorizedRoles("admin", "dietitian"),
    FetchEquipment
  );




module.exports = router;
