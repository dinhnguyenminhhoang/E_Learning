"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "QuizAttempt";
const COLLECTION_NAME = "QuizAttempts";

const answerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    selectedAnswer: {
      type: String,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    pointsEarned: {
      type: Number,
      min: 0,
      default: 0,
    },
    timeSpent: {
      type: Number,
      min: 0,
      default: 0, // tính theo giây hoặc ms
    },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    score: {
      type: Number,
      min: 0,
      default: 0,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    timeSpent: {
      type: Number,
      min: 0,
      default: 0, // tổng thời gian làm quiz
    },

    status: {
      type: String,
      enum: ["completed", "abandoned", "in_progress"],
      default: "in_progress",
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
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
quizAttemptSchema.index({ user: 1, quiz: 1, status: 1 });

// ===== VIRTUALS =====
quizAttemptSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// ===== METHODS =====
quizAttemptSchema.methods.finishAttempt = function (finalScore, finalPercentage) {
  this.score = finalScore;
  this.percentage = finalPercentage;
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

// ===== STATICS =====
quizAttemptSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, deletedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
quizAttemptSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

// Query middleware để loại bỏ deleted records
quizAttemptSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, quizAttemptSchema);
