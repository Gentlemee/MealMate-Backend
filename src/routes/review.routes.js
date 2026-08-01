const express = require("express");
const router = express.Router();

const {
  createReview,
  getMealReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

const { protect } = require("../middleware/authmiddleware");

// Create a review
router.post("/", protect, createReview);

// Get all reviews for a meal
router.get("/:mealId", getMealReviews);

// Update a review
router.put("/:id", protect, updateReview);

// Delete a review
router.delete("/:id", protect, deleteReview);

module.exports = router;