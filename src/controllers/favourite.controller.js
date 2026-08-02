import {
  addFavourite as addFavouriteService,
  getFavourites as getFavouritesService,
  removeFavourite as removeFavouriteService,
} from "../services/favourite.service.js";

// Add a meal to favourites
export const addFavourite = async (req, res) => {
  try {
    const { mealId } = req.body;
    const customerId = req.user._id;

    if (!mealId) {
      return res.status(400).json({
        success: false,
        message: "Meal ID is required",
      });
    }

    const favourite = await addFavouriteService(customerId, mealId);

    res.status(201).json({
      success: true,
      message: "Meal added to favourites successfully",
      data: favourite,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customer's favourite meals
export const getFavourites = async (req, res) => {
  try {
    const customerId = req.user._id;

    const favourites = await getFavouritesService(customerId);

    res.status(200).json({
      success: true,
      data: favourites,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove a meal from favourites
export const removeFavourite = async (req, res) => {
  try {
    const { mealId } = req.params;
    const customerId = req.user._id;

    const favourite = await removeFavouriteService(customerId, mealId);

    res.status(200).json({
      success: true,
      message: "Meal removed from favourites successfully",
      data: favourite,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};