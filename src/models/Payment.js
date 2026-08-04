import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ['Paystack', 'Flutterwave', 'Cash'],
      default: 'Paystack',
    },

    transactionReference: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },

    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);