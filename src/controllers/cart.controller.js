import * as cartService from "../services/cart.service.js";

// Add a meal to cart
const addToCart = async (req, res) => {
  try {
    const { mealId, quantity } = req.body;
    const customerId = req.user._id;

    const cart = await cartService.addToCart(
      customerId,
      mealId,
      quantity
    );

    res.status(201).json({
      success: true,
      message: "Meal added to cart successfully",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customer's cart
const getCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const cart = await cartService.getCart(customerId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update cart item quantity
const updateCart = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { quantity } = req.body;
    const customerId = req.user._id;

    const cart = await cartService.updateCart(
      customerId,
      mealId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove a meal from cart
const removeFromCart = async (req, res) => {
  try {
    const { mealId } = req.params;
    const customerId = req.user._id;

    const cart = await cartService.removeFromCart(
      customerId,
      mealId
    );

    res.status(200).json({
      success: true,
      message: "Meal removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const cart = await cartService.clearCart(customerId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
};