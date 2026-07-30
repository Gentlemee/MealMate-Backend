const Order = require("../models/Order");
const Cart = require("../models/Cart");

// =========================
// Create Order
// =========================
const createOrder = async (
  customerId,
  deliveryAddress,
  paymentMethod
) => {
  // Get customer's cart
  const cart = await Cart.findOne({
    customer: customerId,
  }).populate({
    path: "items.meal",
    populate: {
      path: "vendor",
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  let totalAmount = 0;

  const orderItems = cart.items.map((item) => {
    if (!item.meal) {
      throw new Error("Meal not found");
    }

    if (!item.meal.vendor) {
      throw new Error(`Vendor not found for meal ${item.meal.name}`);
    }

    const price = item.meal.discountPrice || item.meal.price;

    totalAmount += price * item.quantity;

    return {
      meal: item.meal._id,
      vendor: item.meal.vendor._id,
      quantity: item.quantity,
      price,
    };
  });

  const order = await Order.create({
    customer: customerId,
    items: orderItems,
    totalAmount,
    deliveryAddress,
    paymentMethod,
  });

  // Clear customer's cart
  cart.items = [];
  await cart.save();

  return await Order.findById(order._id)
    .populate("customer", "name email phoneNumber")
    .populate("items.meal")
    .populate("items.vendor", "businessName");
};

// =========================
// Get Customer Orders
// =========================
const getMyOrders = async (customerId) => {
  return await Order.find({
    customer: customerId,
  })
    .populate("items.meal")
    .populate("items.vendor", "businessName")
    .sort({ createdAt: -1 });
};

// =========================
// Get Single Order
// =========================
const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate("customer", "name email phoneNumber")
    .populate("items.meal")
    .populate("items.vendor", "businessName");

  if (!order) {
    throw new Error("Order not found");
  }

  // Customer can only see their own order
  if (
    user.role === "customer" &&
    order.customer._id.toString() !== user._id.toString()
  ) {
    throw new Error("Not authorized");
  }

  // Vendor can only see orders containing their meals
  if (user.role === "vendor") {
    const hasVendorMeal = order.items.some(
      (item) => item.vendor._id.toString() === user.vendor.toString()
    );

    if (!hasVendorMeal) {
      throw new Error("Not authorized");
    }
  }

  return order;
};

// =========================
// Cancel Order
// =========================
const cancelOrder = async (orderId, customerId) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (
    order.orderStatus !== "pending" &&
    order.orderStatus !== "accepted"
  ) {
    throw new Error("Order can no longer be cancelled");
  }

  order.orderStatus = "cancelled";

  await order.save();

  return order;
};

// =========================
// Order History
// =========================
const getOrderHistory = async (customerId) => {
  return await Order.find({
    customer: customerId,
    orderStatus: {
      $in: ["delivered", "cancelled"],
    },
  })
    .populate("items.meal")
    .populate("items.vendor", "businessName")
    .sort({ createdAt: -1 });
};

// =========================
// Vendor Orders
// =========================
const getVendorOrders = async (vendorId) => {
  return await Order.find({
    "items.vendor": vendorId,
  })
    .populate("customer", "name phoneNumber")
    .populate("items.meal")
    .sort({ createdAt: -1 });
};

// =========================
// Update Order Status
// =========================
const updateOrderStatus = async (
  orderId,
  status,
  vendorId
) => {
  const allowedStatuses = [
    "accepted",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const hasVendorMeal = order.items.some(
    (item) => item.vendor.toString() === vendorId.toString()
  );

  if (!hasVendorMeal) {
    throw new Error("Not authorized");
  }

  order.orderStatus = status;

  await order.save();

  return await Order.findById(order._id)
    .populate("customer", "name email phoneNumber")
    .populate("items.meal")
    .populate("items.vendor", "businessName");
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