const asyncHandler = require("express-async-handler");
const orderService = require("../services/order.service");

exports.createOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod } = req.body;

  const cart = await orderService.createOrder(
    req.user._id,
    deliveryAddress,
    paymentMethod
  );

  res.status(200).json({
    success: true,
    data: cart,
  });
});
exports.getMyOrders = asyncHandler(async (req, res) => {});

exports.getOrderById = asyncHandler(async (req, res) => {});

exports.cancelOrder = asyncHandler(async (req, res) => {});

exports.getOrderHistory = asyncHandler(async (req, res) => {});

exports.getVendorOrders = asyncHandler(async (req, res) => {});

exports.updateOrderStatus = asyncHandler(async (req, res) => {});