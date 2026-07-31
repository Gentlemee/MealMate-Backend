const mongoose = require('mongoose');

const mealImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    altText: {
      type: String,
      default: '',
      trim: true,
    },
    isCover: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const mealAvailabilitySchema = new mongoose.Schema(
  {
    isAvailable: {
      type: Boolean,
      default: true,
    },
    dailyStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableFrom: {
      type: String,
      default: '',
      trim: true,
    },
    availableUntil: {
      type: String,
      default: '',
      trim: true,
    },
    blackoutDates: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    _id: false,
  }
);

const mealVariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    servingLabel: {
      type: String,
      default: '',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const mealSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    kitchen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kitchen',
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealCategory',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a meal name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    prepTimeMinutes: {
      type: Number,
      default: 30,
      min: 0,
    },
    dietaryTags: [
      {
        type: String,
        trim: true,
      },
    ],
    allergenTags: [
      {
        type: String,
        trim: true,
      },
    ],
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra-hot'],
      default: 'mild',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    visibility: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    availability: {
      type: mealAvailabilitySchema,
      default: () => ({
        isAvailable: true,
        dailyStock: 0,
        remainingStock: 0,
        availableFrom: '',
        availableUntil: '',
        blackoutDates: [],
      }),
    },
    variants: [mealVariantSchema],
    images: [mealImageSchema],
  },
  {
    timestamps: true,
  }
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