"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "UserAchievement";
const COLLECTION_NAME = "UserAchievements";

const userAchievementSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    achievement: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
      index: true,
    },

    unlockedAt: {
      type: Date,
      default: null,
      index: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
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
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ isCompleted: 1, progress: 1 });

// ===== VIRTUALS =====
userAchievementSchema.virtual("completionRate").get(function () {
  return this.progress;
});

// ===== STATICS =====
userAchievementSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, deletedAt: null }).populate("achievement");
};

// ===== MIDDLEWARES =====
// Soft delete
userAchievementSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

// Query middleware để loại bỏ record đã soft delete
userAchievementSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, userAchievementSchema);
