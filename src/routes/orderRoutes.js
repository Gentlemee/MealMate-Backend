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

// Customer
router.post("/", protect, authorize("customer"), createOrder);
router.get("/", protect, authorize("customer"), getMyOrders);
router.get("/history", protect, authorize("customer"), getOrderHistory);

// Customer / Vendor / Admin
router.get("/:id", protect, getOrderById);

// Customer
router.delete("/:id", protect, authorize("customer"), cancelOrder);

// Vendor
router.get(
  "/vendor/orders",
  protect,
  authorize("vendor"),
  getVendorOrders
);

// Vendor/Admin
router.patch(
  "/:id/status",
  protect,
  authorize("vendor", "admin"),
  updateOrderStatus
);

module.exports = router;