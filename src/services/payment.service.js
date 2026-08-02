const axios = require("axios");
const Order = require("../models/Order");

// Initialize Payment

const initializePayment = async (orderId, user) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // Customer can only pay for their own order
  if (order.customer.toString() !== user._id.toString()) {
    throw new Error("Not authorized");
  }

  if (order.paymentStatus === "paid") {
    throw new Error("Order has already been paid");
  }

  const response = await axios.post(
    `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email: user.email,
      amount: order.totalAmount * 100, // Convert Naira to Kobo
      metadata: {
        orderId: order._id,
        customerId: user._id,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  order.paymentReference = response.data.data.reference;

  await order.save();

  return response.data.data;
};

// Verify Payment

const verifyPayment = async (reference) => {
  const response = await axios.get(
    `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const payment = response.data.data;

  const order = await Order.findOne({
    paymentReference: reference,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (payment.status === "success") {
    order.paymentStatus = "paid";
    order.paidAt = payment.paid_at
      ? new Date(payment.paid_at)
      : new Date();
  } else {
    order.paymentStatus = "failed";
  }

  await order.save();

  return {
    paymentStatus: order.paymentStatus,
    paymentReference: reference,
    order,
    paystack: payment,
  };
};

module.exports = {
  initializePayment,
  verifyPayment,
};