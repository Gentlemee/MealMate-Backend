import express from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder, getOrderHistory, getVendorOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, authorize("customer"), createOrder);
router.get("/my-orders", protect, authorize("customer"), getMyOrders);
router.get("/history", protect, authorize("customer"), getOrderHistory);
router.get("/:id", protect, getOrderById);
router.patch("/:id/cancel", protect, authorize("customer"), cancelOrder);
router.get("/vendor/orders", protect, authorize("vendor"), getVendorOrders);
router.patch("/:id/status", protect, authorize("vendor"), updateOrderStatus);

export default router;
