const express = require('express');
const router = express.Router();
const {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getMealCategories,
  createMealCategory,
  updateMealCategory,
  deleteMealCategory,
  getMealAvailability,
  updateMealAvailability,
  addMealImage,
  getMealImages,
  updateMealImage,
  deleteMealImage,
  getPopularMeals,
  getRecommendedMeals,
} = require('../controllers/mealController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateMealAvailabilityUpdate,
  validateMealCategoryCreate,
  validateMealCategoryUpdate,
  validateMealCreate,
  validateMealImageCreate,
  validateMealImageUpdate,
  validateMealQuery,
  validateMealUpdate,
  validateObjectIdParam,
} = require('../middleware/validateRequest');

router.get('/popular', getPopularMeals);
router.get('/recommended', getRecommendedMeals);

router
  .route('/categories')
  .get(getMealCategories)
  .post(protect, authorize('admin'), validateMealCategoryCreate, createMealCategory);

router
  .route('/categories/:id')
  .patch(
    protect,
    authorize('admin'),
    validateObjectIdParam('id'),
    validateMealCategoryUpdate,
    updateMealCategory
  )
  .delete(protect, authorize('admin'), validateObjectIdParam('id'), deleteMealCategory);

router
  .route('/')
  .post(protect, authorize('vendor', 'admin'), validateMealCreate, createMeal)
  .get(validateMealQuery, getMeals);

router
  .route('/:id')
  .get(validateObjectIdParam('id'), getMealById)
  .patch(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateMealUpdate,
    updateMeal
  )
  .delete(protect, authorize('vendor', 'admin'), validateObjectIdParam('id'), deleteMeal);

router
  .route('/:id/availability')
  .get(validateObjectIdParam('id'), getMealAvailability)
  .patch(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateMealAvailabilityUpdate,
    updateMealAvailability
  );

router
  .route('/:id/images')
  .get(validateObjectIdParam('id'), getMealImages)
  .post(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateMealImageCreate,
    addMealImage
  );

router
  .route('/:id/images/:imageId')
  .patch(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateObjectIdParam('imageId'),
    validateMealImageUpdate,
    updateMealImage
  )
  .delete(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateObjectIdParam('imageId'),
    deleteMealImage
  );

module.exports = router;
