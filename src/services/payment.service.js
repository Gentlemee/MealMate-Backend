const Order = require("../models/Order");

// Initialize Payment
const initializePayment = async (orderId, customerId) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus === "paid") {
    throw new Error("Order has already been paid");
  }

  return {
    orderId: order._id,
    amount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    message: "Payment initialized successfully.",
  };
};

// Verify Payment (Placeholder)
const verifyPayment = async (orderId, customerId) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

module.exports = {
  initializePayment,
  verifyPayment,
};