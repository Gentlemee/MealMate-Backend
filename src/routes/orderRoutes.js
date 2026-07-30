const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderHistory,
  getVendorOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Customer Routes


// Create Order
router.post(
  "/",
  protect,
  authorize("customer"),
  createOrder
);

// Get Customer Orders
router.get(
  "/my-orders",
  protect,
  authorize("customer"),
  getMyOrders
);

// Get Customer Order History
router.get(
  "/history",
  protect,
  authorize("customer"),
  getOrderHistory
);

// Get Single Order
router.get(
  "/:id",
  protect,
  getOrderById
);

// Cancel Order
router.patch(
  "/:id/cancel",
  protect,
  authorize("customer"),
  cancelOrder
);

// Vendor Routes


// Get Vendor Orders
router.get(
  "/vendor/orders",
  protect,
  authorize("vendor"),
  getVendorOrders
);

// Update Order Status
router.patch(
  "/:id/status",
  protect,
  authorize("vendor"),
  updateOrderStatus
);

module.exports = router;