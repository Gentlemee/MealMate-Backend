import express from "express";

import {
  createReview,
  getMealReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Create a review
router.post("/", protect, createReview);

// Get all reviews for a meal
router.get("/:mealId", getMealReviews);

// Update a review
router.put("/:id", protect, updateReview);

// Delete a review
router.delete("/:id", protect, deleteReview);

export default router;