const express = require('express');
const router = express.Router();
const {
  registerRiderProfile,
  getRiderProfile,
  toggleAvailability,
} = require('../controllers/riderController');

// Note: Replace 'protect' with your actual authentication middleware name if different
const { protect } = require('../middleware/authMiddleware');

router.post('/register', protect, registerRiderProfile);
router.get('/me', protect, getRiderProfile);
router.patch('/availability', protect, toggleAvailability);

module.exports = router;