import express from "express";

import {
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get customer's cart
router.get("/", protect, getCart);

// Update meal quantity
router.patch("/:mealId", protect, updateCart);

// Remove a meal from cart
router.delete("/:mealId", protect, removeFromCart);

// Clear the entire cart
router.delete("/", protect, clearCart);

export default router;