"use strict";

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // === RECIPIENT ===
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true
  },
  
  // === NOTIFICATION CONTENT ===
  type: {
    type: String,
    enum: [
      'order_status_update',
      'payment_received',
      'message_received',
      'review_received',
      'wishlist_price_drop',
      'portfolio_approved',
      'milestone_completed',
      'delivery_reminder',
      'system_announcement',
      'promotional',
      'security_alert'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // === METADATA ===
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    url: String,
    actionRequired: Boolean,
    customData: mongoose.Schema.Types.Mixed
  },
  
  // === STATUS ===
  status: {
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    isArchived: { type: Boolean, default: false },
    archivedAt: Date
  },
  
  // === DELIVERY ===
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    error: String
  }],
  
  // === SCHEDULING ===
  scheduling: {
    scheduledFor: Date,
    isScheduled: { type: Boolean, default: false },
    timezone: String
  },
  
  // === PRIORITY ===
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  }
}, {
  timestamps: true,
  index: { createdAt: -1 }
});

// === INDEXES ===
notificationSchema.index({ recipient: 1, 'status.isRead': 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ 'scheduling.scheduledFor': 1, 'scheduling.isScheduled': 1 });

// === METHODS ===
notificationSchema.methods.markAsRead = function() {
  this.status.isRead = true;
  this.status.readAt = new Date();
  return this.save();
};

notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Send via appropriate channels
  await notification.sendToChannels();
  
  return notification;
};

notificationSchema.methods.sendToChannels = async function() {
  // Implementation would depend on your notification service
  console.log(`Sending notification: ${this.title} to user: ${this.recipient}`);
};