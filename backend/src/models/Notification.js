"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "UserNotification";
const COLLECTION_NAME = "UserNotifications";

const userNotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["study_reminder", "achievement", "streak_broken", "system"],
      required: true,
      index: true,
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

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },

    sentAt: {
      type: Date,
      default: null,
      index: true,
    },

    sendToEmail: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
  }
);

// ===== INDEXES =====
userNotificationSchema.index({ user: 1, isRead: 1, type: 1 });
userNotificationSchema.index({ scheduledAt: 1 });
userNotificationSchema.index({ sentAt: 1 });

// ===== STATICS =====
userNotificationSchema.statics.findUnreadByUser = function (userId) {
  return this.find({ user: userId, isRead: false, deletedAt: null }).sort({
    createdAt: -1,
  });
};

// ===== MIDDLEWARES =====
// Soft delete
userNotificationSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

// Query middleware để tự động filter soft delete
userNotificationSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, userNotificationSchema);
