import express from "express";
import {
  getDashboardStats,
  getAllRiders,
  updateRiderStatus,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all admin routes and restrict access to admin role
router.use(protect);
router.use(authorize("admin"));

// Admin dashboard statistics
router.get("/stats", getDashboardStats);

// Get all riders
router.get("/riders", getAllRiders);

// Update rider status
router.patch("/riders/:id/status", updateRiderStatus);

export default router;