import express from "express";
import { createReview, getMealReviews, updateReview, deleteReview } from "../controllers/review.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createReview);
router.get("/:mealId", getMealReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
