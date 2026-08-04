import mongoose from 'mongoose';

const openingHourSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },
    opensAt: {
      type: String,
      required: true,
    },
    closesAt: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please add a business name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a business phone number'],
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOpenNow: {
      type: Boolean,
      default: true,
    },
    minimumPrepTimeMinutes: {
      type: Number,
      default: 30,
      min: 0,
    },
    deliveryRadiusKm: {
      type: Number,
      default: 5,
      min: 0,
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
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'Nigeria' },
      lat: { type: Number },
      lng: { type: Number },
    },
    dietaryTags: [
      {
        type: String,
        trim: true,
      },
    ],
    cuisines: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    openingHours: [openingHourSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Vendor', vendorSchema);
