"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "UserLearningPath";
const COLLECTION_NAME = "UserLearningPaths";

const userLearningPathSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    learningPath: {
      type: Schema.Types.ObjectId,
      ref: "LearningPath",
      required: true,
      index: true,
    },

    target: {
      type: Schema.Types.ObjectId,
      ref: "Target",
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "paused", "abandoned", "completed"],
        message:
          "Status must be one of: active, paused, abandoned, completed",
      },
      default: "paused",
      index: true,
    },

    // Tiến độ học
    progress: {
      currentLevel: { type: Number, default: 1, min: 1 },
      currentLesson: { type: Number, default: 1, min: 1 },
      completedLessons: [{ type: String }],
      startedAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },

    // Mục tiêu học/ngày
    dailyGoal: {
      type: Number,
      default: 10,
      min: [1, "Daily goal must be at least 1"],
    },

    lastAccAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    weakWords: [{ type: Schema.Types.ObjectId, ref: "Word" }],

    totalTimeSpent: {
      type: Number,
      default: 0,
      min: [0, "Total time spent cannot be negative"],
    },

    averageSessionTime: {
      type: Number,
      default: 0,
      min: [0, "Average session time cannot be negative"],
    },

    updatedAt: {
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

userLearningPathSchema.index({ user: 1, learningPath: 1 }, { unique: true });
userLearningPathSchema.index({ user: 1, status: 1 });
userLearningPathSchema.index({ lastAccAt: -1 });
userLearningPathSchema.index({ updatedAt: 1 }, { sparse: true });

module.exports = model(DOCUMENT_NAME, userLearningPathSchema);
