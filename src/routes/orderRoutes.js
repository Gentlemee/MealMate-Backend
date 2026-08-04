import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderHistory,
  getVendorOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  protect,
  authorize,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer Routes

// Create Order
router.post(
  '/',
  protect,
  authorize('customer'),
  createOrder
);

// Get Customer Orders
router.get(
  '/my-orders',
  protect,
  authorize('customer'),
  getMyOrders
);

// Get Customer Order History
router.get(
  '/history',
  protect,
  authorize('customer'),
  getOrderHistory
);

// Get Single Order
router.get(
  '/:id',
  protect,
  getOrderById
);

// Cancel Order
router.patch(
  '/:id/cancel',
  protect,
  authorize('customer'),
  cancelOrder
);

// Vendor Routes

// Get Vendor Orders
router.get(
  '/vendor/orders',
  protect,
  authorize('vendor'),
  getVendorOrders
);

// Update Order Status
router.patch(
  '/:id/status',
  protect,
  authorize('vendor'),
  updateOrderStatus
);

export default router;