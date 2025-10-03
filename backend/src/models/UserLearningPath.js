"use strict";

const { model, Schema, Types } = require("mongoose");
const { STATUS } = require("../constants/status.constans");
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
    status: {
      type: String,
      enum: {
        values: ["active", "abandoned", "completed"],
        message: "Status must be active, abandoned, or completed",
      },
      default: "active",
      index: true,
    },
    progress: {
      currentLevel: { type: Number, default: 1, min: 1 },
      currentLesson: { type: Number, default: 1, min: 1 },
      completedLessons: [{ type: Number }],
      startedAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
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

// Indexes
userLearningPathSchema.index({ user: 1, learningPath: 1 });
userLearningPathSchema.index({ status: 1 });
userLearningPathSchema.index({ lastAccAt: -1 });
userLearningPathSchema.index({ updatedAt: 1 }, { sparse: true });

// Methods
userLearningPathSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, updatedAt: null });
};

// Middleware
userLearningPathSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.progress.updatedAt = new Date();
    this.lastAccAt = new Date();
  }
  next();
});

userLearningPathSchema.pre(
  ["find", "findOne", "findOneAndUpdate"],
  function () {
    if (!("status" in this.getQuery())) {
      this.where({ status: { $ne: STATUS.DELETED } });
    }
  }
);

module.exports = model(DOCUMENT_NAME, userLearningPathSchema);
