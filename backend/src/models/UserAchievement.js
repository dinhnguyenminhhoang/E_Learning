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
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
  }
);

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ isCompleted: 1, progress: 1 });

userAchievementSchema.virtual("completionRate").get(function () {
  return this.progress;
});

userAchievementSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, deletedAt: null }).populate("achievement");
};

userAchievementSchema.pre("find", function () {
  if (this.getQuery().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

userAchievementSchema.pre("findOne", function () {
  if (this.getQuery().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

userAchievementSchema.pre("countDocuments", function () {
  if (this.getQuery().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

module.exports = model(DOCUMENT_NAME, userAchievementSchema);
