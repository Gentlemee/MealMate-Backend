const express = require('express');
const router = express.Router();
const {
  createKitchen,
  getKitchens,
  updateKitchen,
  deleteKitchen,
} = require('../controllers/kitchenController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateObjectIdParam,
  validateKitchenCreate,
  validateKitchenUpdate,
} = require('../middleware/validateRequest');

router
  .route('/')
  .post(
    protect,
    authorize('vendor', 'admin'),
    validateKitchenCreate,
    createKitchen
  )
  .get(getKitchens);

router
  .route('/:id')
  .patch(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateKitchenUpdate,
    updateKitchen
  )
  .delete(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    deleteKitchen
  );

module.exports = router;
