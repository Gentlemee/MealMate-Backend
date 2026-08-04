import mongoose from 'mongoose';

const kitchenSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a kitchen/storefront name'],
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
    serviceModes: [
      {
        type: String,
        enum: ['delivery', 'pickup', 'dine-in'],
        default: 'delivery',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'Nigeria' },
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Kitchen', kitchenSchema);
