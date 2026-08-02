import Favourite from "../models/favourite.js";

// Add a meal to favourites
export const addFavourite = async (customerId, mealId) => {
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
export const getFavourites = async (customerId) => {
  const favourites = await Favourite.find({
    customer: customerId,
  }).populate("meal");

  return favourites;
};

// Remove a meal from favourites
export const removeFavourite = async (customerId, mealId) => {
  const favourite = await Favourite.findOneAndDelete({
    customer: customerId,
    meal: mealId,
  });

  if (!favourite) {
    throw new Error("Meal not found in favourites");
  }

  return favourite;
};