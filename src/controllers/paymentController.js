import asyncHandler from 'express-async-handler';
import * as paymentService from '../services/payment.service.js';

// Initialize Payment
export const initializePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.initializePayment(
    req.params.orderId,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Payment initialized successfully.",
    data: payment,
  });
});

// Verify Payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPayment(
    req.params.reference
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    data: payment,
  });
});