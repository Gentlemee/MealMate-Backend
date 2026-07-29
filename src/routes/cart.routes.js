const express = require("express");

const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

// Add a meal to cart
router.post("/", protect, addToCart);

// Get customer's cart
router.get("/", protect, getCart);

// Update meal quantity
router.patch("/:mealId", protect, updateCart);

// Remove a meal from cart
router.delete("/:mealId", protect, removeFromCart);

// Clear the entire cart
router.delete("/", protect, clearCart);

module.exports = router;