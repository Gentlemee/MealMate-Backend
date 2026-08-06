import User from "../models/Users.js";
import Rider from "../models/Rider.js";
import Order from "../models/Order.js";

// @desc    Get system dashboard overview stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRiders = await Rider.countDocuments();
    const pendingRiders = await Rider.countDocuments({ status: "pending" });
    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRiders,
        pendingRiders,
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get all riders (or filter by status e.g., ?status=pending)
// @route   GET /api/admin/riders
// @access  Private (Admin only)
const getAllRiders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const riders = await Rider.find(filter).populate(
      "user",
      "name email phoneNumber role"
    );

    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Approve or Reject a rider application
// @route   PATCH /api/admin/riders/:id/status
// @access  Private (Admin only)
const updateRiderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status provided",
      });
    }

    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    rider.status = status;
    await rider.save();

    res.status(200).json({
      success: true,
      message: `Rider status updated to ${status}`,
      data: rider,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  getDashboardStats,
  getAllRiders,
  updateRiderStatus,
};