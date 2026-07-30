const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Meal = require("../models/Meal");

// Create Order
const createOrder = async (
  customerId,
  deliveryAddress,
  paymentMethod
) => {
  // Find customer's cart and load meal details
  const cart = await Cart.findOne({
    customer: customerId,
  }).populate("items.meal");

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  return cart;
};

// Get Customer Orders
const getMyOrders = async (customerId) => {

};

// Get Single Order
const getOrderById = async (orderId, user) => {

};

// Cancel Order
const cancelOrder = async (orderId, customerId) => {

};

// Get Order History
const getOrderHistory = async (customerId) => {

};

// Get Vendor Orders
const getVendorOrders = async (vendorId) => {

};

// Update Order Status
const updateOrderStatus = async (orderId, status, vendorId) => {

};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderHistory,
  getVendorOrders,
  updateOrderStatus,
};