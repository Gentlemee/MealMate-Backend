const Favourite = require("../models/favourite");

// Add a meal to favourites
const addFavourite = async (customerId, mealId) => {
  // Check if the meal is already in favourites
  const existingFavourite = await Favourite.findOne({
    customer: customerId,
    meal: mealId,
  });

  if (existingFavourite) {
    throw new Error("Meal is already in favourites");
  }

  const favourite = await Favourite.create({
    customer: customerId,
    meal: mealId,
  });

  return favourite;
};

// Get all favourites for a customer
const getFavourites = async (customerId) => {
  const favourites = await Favourite.find({
    customer: customerId,
  }).populate("meal");

  return favourites;
};

// Remove a meal from favourites
const removeFavourite = async (customerId, mealId) => {
  const favourite = await Favourite.findOneAndDelete({
    customer: customerId,
    meal: mealId,
  });

  if (!favourite) {
    throw new Error("Meal not found in favourites");
  }

  return favourite;
};

module.exports = {
  addFavourite,
  getFavourites,
  removeFavourite,
};