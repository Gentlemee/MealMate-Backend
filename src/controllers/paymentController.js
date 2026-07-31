const asyncHandler = require("express-async-handler");
const paymentService = require("../services/payment.service");

// Initialize Payment
exports.initializePayment = asyncHandler(async (req, res) => {
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
exports.verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPayment(
    req.params.reference
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    data: payment,
  });
});