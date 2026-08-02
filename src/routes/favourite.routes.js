import express from "express";

import {
  addFavourite,
  getFavourites,
  removeFavourite,
} from "../controllers/favourite.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add a meal to favourites
router.post("/", protect, addFavourite);

// Get customer's favourite meals
router.get("/", protect, getFavourites);

// Remove a meal from favourites
router.delete("/:mealId", protect, removeFavourite);

export default router;