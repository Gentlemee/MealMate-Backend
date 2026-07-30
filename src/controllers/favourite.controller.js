const favouriteService = require("../services/favourite.service");

// Add a meal to favourites
const addFavourite = async (req, res) => {
  try {
    const { mealId } = req.body;
    const customerId = req.user._id;

    const favourite = await favouriteService.addFavourite(
      customerId,
      mealId
    );

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
const getFavourites = async (req, res) => {
  try {
    const customerId = req.user._id;

    const favourites = await favouriteService.getFavourites(customerId);

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
const removeFavourite = async (req, res) => {
  try {
    const { mealId } = req.params;
    const customerId = req.user._id;

    const favourite = await favouriteService.removeFavourite(
      customerId,
      mealId
    );

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

module.exports = {
  addFavourite,
  getFavourites,
  removeFavourite,
};