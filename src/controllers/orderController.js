const asyncHandler = require("express-async-handler");
const orderService = require("../services/order.service");

// Create Order

exports.createOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod } = req.body;

  const order = await orderService.createOrder(
    req.user._id,
    deliveryAddress,
    paymentMethod
  );

  res.status(201).json({
    success: true,
    message: "Orders created successfully.",
    data: order,
  });
});

// Get My Orders

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user._id);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// Get Single Order

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// Cancel Order

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    data: order,
  });
});

// Order History

exports.getOrderHistory = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrderHistory(req.user._id);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// Vendor Orders

exports.getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getVendorOrders(req.user.vendor);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});


// Update Order Status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    req.user.vendor
  );

  res.status(200).json({
    success: true,
    message: "Order status updated successfully.",
    data: order,
  });
});