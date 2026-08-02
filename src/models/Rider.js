const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema(
  {
    // Link directly to the User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'bicycle', 'car', 'van'],
      required: [true, 'Please specify vehicle type'],
    },
    licensePlate: {
      type: String,
      required: [true, 'Please add license plate number'],
    },
    isAvailable: {
      type: Boolean,
      default: false, // Rider toggles online/offline
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending', // Admins approve riders before they can deliver
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Rider', riderSchema);