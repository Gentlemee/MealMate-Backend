const express = require('express');
const router = express.Router();
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateObjectIdParam,
  validateVendorCreate,
  validateVendorQuery,
  validateVendorUpdate,
} = require('../middleware/validateRequest');

router
  .route('/')
  .post(protect, authorize('vendor', 'admin'), validateVendorCreate, createVendor)
  .get(validateVendorQuery, getVendors);

router
  .route('/:id')
  .get(validateObjectIdParam('id'), getVendorById)
  .patch(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    validateVendorUpdate,
    updateVendor
  )
  .delete(
    protect,
    authorize('vendor', 'admin'),
    validateObjectIdParam('id'),
    deleteVendor
  );

module.exports = router;
