import asyncHandler from "express-async-handler";
import * as orderService from "../services/order.service.js";

const createOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod } = req.body;
  const order = await orderService.createOrder(req.user._id, deliveryAddress, paymentMethod);
  res.status(201).json({ success: true, message: "Orders created successfully.", data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user._id);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  res.status(200).json({ success: true, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: "Order cancelled successfully.", data: order });
});

const getOrderHistory = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrderHistory(req.user._id);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const getVendorOrders = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendor || req.user._id;
  const orders = await orderService.getVendorOrders(vendorId);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const vendorId = req.user.vendor || req.user._id;
  const order = await orderService.updateOrderStatus(req.params.id, status, vendorId);
  res.status(200).json({ success: true, message: "Order status updated successfully.", data: order });
});

export { createOrder, getMyOrders, getOrderById, cancelOrder, getOrderHistory, getVendorOrders, updateOrderStatus };
