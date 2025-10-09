"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "UserProgress";
const COLLECTION_NAME = "UserProgresses";

const userProgressSchema = new Schema(
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

    levelOrder: {
      type: Number, // thứ tự level trong lộ trình
      required: true,
      min: 1,
      index: true,
    },

    lessonOrder: {
      type: Number, // thứ tự bài học (hoặc quiz) trong level
      required: true,
      min: 1,
      index: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "review"],
      default: "not_started",
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    attempts: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    timeSpent: {
      type: Number,
      default: 0, // tổng thời gian học (giây hoặc phút)
    },

    updatedAt: {
      type: Date,
      default: null,
      index: true,
    },
    updatedBy: {
      type: String,
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
userProgressSchema.index(
  { user: 1, learningPath: 1, levelOrder: 1, lessonOrder: 1 },
  { unique: true }
);

// ===== VIRTUALS =====
userProgressSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// ===== METHODS =====
userProgressSchema.methods.markCompleted = function (score = 100) {
  this.status = "completed";
  this.score = score;
  this.completedAt = new Date();
  return this.save();
};

// ===== STATICS =====
userProgressSchema.statics.findByUserAndPath = function (userId, pathId) {
  return this.find({ user: userId, learningPath: pathId, updatedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
userProgressSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date(), status: "not_started" });
});

// Query middleware để loại bỏ deleted records
userProgressSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!("status" in this.getQuery())) {
      this.where({ status: { $ne: STATUS.DELETED } });
    }
  }
);

module.exports = model(DOCUMENT_NAME, userProgressSchema);
