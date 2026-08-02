const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // The recipient who receives the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['order_update', 'delivery_update', 'system_alert', 'account_update'],
      default: 'system_alert',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional link to an associated order or resource
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'onModel',
    },
    onModel: {
      type: String,
      enum: ['Order', 'Meal', 'Payment'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);