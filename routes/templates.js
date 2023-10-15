const express = require('express');
const router = express.Router();
const {createEntity,deleteEntity,getAllEntities,getEntityById,updateEntity}=require('../templates/controller')
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

// Middleware functions like isAuthenticated and authorizedRoles here

// Define a generic route for CRUD operations
router.post('/:entity/add', isAuthenticated('web'), authorizedRoles('dietitian', 'admin'), createEntity);
router.delete('/:entity/delete/:entityId', isAuthenticated('web'), authorizedRoles('dietitian', 'admin'), deleteEntity);
router.put('/:entity/update/:entityId', isAuthenticated('web'), authorizedRoles('dietitian', 'admin'), updateEntity);
router.get('/:entity', isAuthenticated('web'), authorizedRoles('dietitian', 'admin'), getAllEntities);
router.get('/:entity/:entityId', isAuthenticated('web'), authorizedRoles('dietitian', 'admin'), getEntityById);

// Here, :entity is a route parameter that specifies the type of entity (meal, exercise, workout)

// Your route handlers should handle the specific entity logic based on the parameter.

module.exports = router;
