const Cart = require("../models/Cart");

const addToCart = async (customerId, mealId, quantity = 1) => {
  let cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    cart = await Cart.create({
      customer: customerId,
      items: [
        {
          meal: mealId,
          quantity,
        },
      ],
    });

    return cart;
  }

  const existingItem = cart.items.find(
    (item) => item.meal.toString() === mealId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      meal: mealId,
      quantity,
    });
  }

  await cart.save();

  return cart;
};

// Get customer's cart
const getCart = async (customerId) => {
  const cart = await Cart.findOne({ customer: customerId }).populate(
    "items.meal"
  );

  if (!cart) {
    return {
      customer: customerId,
      items: [],
    };
  }

  return cart;
};
// Update the quantity of a meal in the cart
const updateCart = async (customerId, mealId, quantity) => {
  const cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (item) => item.meal.toString() === mealId.toString()
  );

  if (!item) {
    throw new Error("Meal not found in cart");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  item.quantity = quantity;

  await cart.save();

  return cart;
};
// Remove a meal from the cart
const removeFromCart = async (customerId, mealId) => {
  const cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.meal.toString() === mealId.toString()
  );

  if (!itemExists) {
    throw new Error("Meal not found in cart");
  }

  cart.items = cart.items.filter(
    (item) => item.meal.toString() !== mealId.toString()
  );

  await cart.save();

  return cart;
};
// Clear all items from the cart
const clearCart = async (customerId) => {
  const cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];

  await cart.save();

  return cart;
};
module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
};