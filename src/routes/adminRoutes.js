const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllRiders,
  updateRiderStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all admin routes and restrict to 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/riders', getAllRiders);
router.patch('/riders/:id/status', updateRiderStatus);

module.exports = router;