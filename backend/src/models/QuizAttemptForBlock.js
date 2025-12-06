"use strict";

const { model, Schema } = require("mongoose");
const { QUIZ_STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "QuizAttemptForBlock";
const COLLECTION_NAME = "QuizAttemptForBlocks";

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
      default: 0,
    },
  },
  { _id: false }
);

const quizAttemptForBlockSchema = new Schema(
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

    block: {
      type: Schema.Types.ObjectId,
      ref: "ContentBlock",
      required: true,
      index: true,
    },

    userBlockProgress: {
      type: Schema.Types.ObjectId,
      ref: "UserBlockProgress",
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

    correctAnswers: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      min: 0,
      default: 0,
    },

    // User must get >= 65% to pass
    isPassed: {
      type: Boolean,
      default: false,
    },

    timeSpent: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
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
quizAttemptForBlockSchema.index({ user: 1, quiz: 1, block: 1 });
quizAttemptForBlockSchema.index({ user: 1, block: 1, status: 1 });

// ===== VIRTUALS =====
quizAttemptForBlockSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// ===== METHODS =====
quizAttemptForBlockSchema.methods.finishAttempt = function (
  answers,
  correctCount,
  totalCount
) {
  this.answers = answers;
  this.correctAnswers = correctCount;
  this.totalQuestions = totalCount;
  this.percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

  // Pass quiz nếu đạt >= 65%
  const PASS_THRESHOLD = 65;
  this.isPassed = this.percentage >= PASS_THRESHOLD;

  this.status = this.isPassed ? "completed" : "in_progress";
  this.completedAt = this.isPassed ? new Date() : null;

  this.score = answers.reduce((sum, ans) => sum + (ans.pointsEarned || 0), 0);

  return this.save();
};

// ===== STATICS =====
quizAttemptForBlockSchema.statics.findByUserAndBlock = function (
  userId,
  blockId
) {
  return this.find({ user: userId, block: blockId }).sort({
    createdAt: -1,
  });
};

quizAttemptForBlockSchema.statics.findLatestAttempt = function (
  userId,
  blockId
) {
  return this.findOne({
    user: userId,
    block: blockId,
  }).sort({ createdAt: -1 });
};

quizAttemptForBlockSchema.statics.findPassedAttempt = function (
  userId,
  blockId
) {
  return this.findOne({
    user: userId,
    block: blockId,
    isPassed: true,
  }).sort({ createdAt: -1 });
};

// ===== MIDDLEWARES =====
quizAttemptForBlockSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date() });
});

module.exports = model(DOCUMENT_NAME, quizAttemptForBlockSchema);
