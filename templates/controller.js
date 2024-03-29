const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHander = require("../utils/errorhander");
const { uploadAndPushImage } = require("../Common/uploadToS3");
// const { Exercise } = require("./model");
const moment = require("moment");
const {addMeal,addMealTemplate}=require('../mealPlanner/controller')
const {Meal}=require('../mealPlanner/model')

const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

exports.createEntity = catchAsyncError(async (req, res, next) => {
  const entity = req.params.entity; // Get the entity type from the route parameter
  const data = req.body; // Assuming the data to create the entity is in the request body

  try {
    let createdEntity;

    switch (entity) {
      case 'meal':
        const {
          name,
          description,
          ytlink1,
          meal_image,
          // nutritions,
          // required_ingredients,
          steps,
        } = data;

        // if (!name || !description || !meal_image || !nutritions || !required_ingredients) {
        //   return next(new ErrorHander("All fields are required", 400));
        // }

        if (!name || !description || !meal_image ) {
          return next(new ErrorHander("All fields are required", 400));
        }

        required_ingredients=[
          {
            "name": "chicken",
            "type": "grams",
            "quantity": 300
          },
          {
            "name": "onion",
            "type": "medium",
            "quantity": 2
          },
          {
            "name": "tomato",
            "type": "medium",
            "quantity": 2
          },
          {
            "name": "spices",
            "type": "packet",
            "quantity": 1
          }
        ]

        nutritions=[
          {
            "type": "Protein",
            "value": 25
          },
          {
            "type": "Carbohydrates",
            "value": 30
          },
          {
            "type": "Fat",
            "value": 15
          }
        ]

        const created_by = req.user._id;

        const sameMeal = await Meal.findOne({ name: name });
        if (sameMeal) {
          console.log("The Meal with the same name already exists ", sameMeal);
          return next(new ErrorHander("Meal with the same name already exists ", 400));
        }

        const formattedNutrition = JSON.parse(nutritions);
        const formatteRequiredIngredients = JSON.parse(required_ingredients);
        const formattedSteps = JSON.parse(steps);

        const newMeal = new Meal({
          name,
          nutritions: formattedNutrition,
          description,
          ytlink1,
          required_ingredients: formatteRequiredIngredients,
          created_by,
          steps: formattedSteps, // Include the steps array
        });

        const meal_image_data = await uploadAndPushImage(
          "images/meal",
          meal_image,
          "meal_image",
          name
        );

        if (!meal_image_data.location) return next(new ErrorHander(data));
        newMeal.meal_image = meal_image_data.location;
        newMeal.meal_image_key = `images/meal${meal_image_data.key}`;
        console.log(
          "req.body.image",
          meal_image_data.location,
          meal_image_data.key
        );

        // Save the new meal to the database
        createdEntity = await newMeal.save();

        if (!createdEntity) {
          return next(new ErrorHander("Failed to save the meal to the database", 500));
        }
        break;

      // Handle other entity types (exercise, workout) similarly

      case 'exercise':
        // Logic to create an exercise
        break;

      case 'workout':
        // Logic to create a workout
        break;

      default:
        return res.status(400).json({ message: 'Invalid entity type' });
    }

    // Return a success response with the created entity
    res.status(201).json({ message: `Created ${entity}`, createdEntity });
  } catch (error) {
    // Handle any error that occurred during the process
    return next(new ErrorHander(error.message, 500));
  }
});

  // Delete Entity
  exports.deleteEntity = catchAsyncError(async (req, res, next) => {
    const entity = req.params.entity; // Get the entity type from the route parameter
    const entityId = req.params.entityId; // Get the entity ID from the route parameter
  
    // Logic to delete the entity based on the entity type and ID
    // You would need to implement this logic for each entity type (meals, exercises, workouts)
    let deletedEntity;
    switch (entity) {
      case 'meal':
        // Logic to delete a meal by ID
        // Example: deletedEntity = await Meal.findByIdAndRemove(entityId);
        break;
      case 'exercise':
        // Logic to delete an exercise by ID
        // Example: deletedEntity = await Exercise.findByIdAndRemove(entityId);
        break;
      case 'workout':
        // Logic to delete a workout by ID
        // Example: deletedEntity = await Workout.findByIdAndRemove(entityId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid entity type' });
    }
  
    // Return a success response with the deleted entity
    res.json({ message: `Deleted ${entity} with ID ${entityId}`, deletedEntity });
  });
  
  // Get All Entities
  exports.getAllEntities = catchAsyncError(async (req, res, next) => {
    const entity = req.params.entity; // Get the entity type from the route parameter
  
    // Logic to fetch all entities of the specified type
    // You would need to implement this logic for each entity type (meals, exercises, workouts)
    let entities;
    switch (entity) {
      case 'meal':
        // Logic to fetch all meals
        // Example: entities = await Meal.find({});
        break;
      case 'exercise':
        // Logic to fetch all exercises
        // Example: entities = await Exercise.find({});
        break;
      case 'workout':
        // Logic to fetch all workouts
        // Example: entities = await Workout.find({});
        break;
      default:
        return res.status(400).json({ message: 'Invalid entity type' });
    }
  
    // Return the list of entities
    res.json({ message: `Fetched all ${entity}s`, entities });
  });
  
  // Get Entity by ID
  exports.getEntityById = catchAsyncError(async (req, res, next) => {
    const entity = req.params.entity; // Get the entity type from the route parameter
    const entityId = req.params.entityId; // Get the entity ID from the route parameter
  
    // Logic to fetch the entity by ID based on the entity type
    // You would need to implement this logic for each entity type (meals, exercises, workouts)
    let fetchedEntity;
    switch (entity) {
      case 'meal':
        // Logic to fetch a meal by ID
        // Example: fetchedEntity = await Meal.findById(entityId);
        break;
      case 'exercise':
        // Logic to fetch an exercise by ID
        // Example: fetchedEntity = await Exercise.findById(entityId);
        break;
      case 'workout':
        // Logic to fetch a workout by ID
        // Example: fetchedEntity = await Workout.findById(entityId);
        break;
      default:
        return res.status(400).json({ message: 'Invalid entity type' });
    }
  
    // Return the fetched entity
    res.json({ message: `Fetched ${entity} with ID ${entityId}`, entity: fetchedEntity });
  });

  
  exports.updateEntity = catchAsyncError(async (req, res, next) => {
    const entity = req.params.entity; // Get the entity type from the route parameter
    const entityId = req.params.entityId; // Get the entity ID from the route parameter
    const updatedData = req.body; // Assuming the updated data is in the request body
    
    let updatedEntity;
    switch (entity) {
      case 'meal':
        // Logic to update a meal by ID
        // Example: updatedEntity = await Meal.findByIdAndUpdate(entityId, updatedData, { new: true });
        break;
      case 'exercise':
        // Logic to update an exercise by ID
        // Example: updatedEntity = await Exercise.findByIdAndUpdate(entityId, updatedData, { new: true });
        break;
      case 'workout':
        // Logic to update a workout by ID
        // Example: updatedEntity = await Workout.findByIdAndUpdate(entityId, updatedData, { new: true });
        break;
      default:
        return res.status(400).json({ message: 'Invalid entity type' });
    }
  
    // Return a success response with the updated entity
    res.json({ message: `Updated ${entity} with ID ${entityId}`, updatedEntity });
  });