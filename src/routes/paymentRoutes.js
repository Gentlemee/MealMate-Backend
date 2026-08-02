const express = require("express");
const router = express.Router();

const {
  initializePayment,
  verifyPayment,
} = require("../controllers/paymentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Initialize Payment
router.post(
  "/:orderId/initialize",
  protect,
  authorize("customer"),
  initializePayment
);

// Verify Payment
router.get(
  "/:orderId/verify",
  protect,
  authorize("customer"),
  verifyPayment
);

module.exports = router;