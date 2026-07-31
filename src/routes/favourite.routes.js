const express = require("express");

const {
  addFavourite,
  getFavourites,
  removeFavourite,
} = require("../controllers/favourite.controller");

const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

// Add a meal to favourites
router.post("/", protect, addFavourite);

// Get customer's favourite meals
router.get("/", protect, getFavourites);

// Remove a meal from favourites
router.delete("/:mealId", protect, removeFavourite);

module.exports = router;