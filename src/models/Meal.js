const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Meal description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Meal price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Main Course', 'Fast Food', 'Drinks', 'Dessert', 'Sides'], // Customize as needed
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // or 'Vendor' if you have a separate vendor model
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);