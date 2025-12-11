"use strict";

const { model, Schema } = require("mongoose");
const { QUIZ_STATUS, STATUS } = require("../constants/status.constans");

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
    writingAnswer: {
      text: String,
      wordCount: Number,
    },

    speakingAnswer: {
      audioUrl: String,
      duration: Number,
    },

    // Writing grading từ Grammar NLP Service
    writingGrading: {
      grading: {
        score: Number,
        level: String,
        overall_comment: String,
        suggestions: [String],
      },
      grammar_errors: [
        {
          message: String,
          shortMessage: String,
          replacements: [
            {
              value: String,
            },
          ],
          offset: Number,
          length: Number,
          context: {
            text: String,
            offset: Number,
            length: Number,
          },
          sentence: String,
          rule: {
            id: String,
            description: String,
            issueType: String,
            category: {
              id: String,
              name: String,
            },
          },
        },
      ],
      original_text: String,
    },
  },
  { _id: false, strict: false } // strict: false để cho phép lưu fields động nếu cần
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
      enum: Object.values(QUIZ_STATUS),
      default: QUIZ_STATUS.INPROGRESS,
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
quizAttemptSchema.index({ user: 1, quiz: 1, status: 1 });

// ===== VIRTUALS =====
quizAttemptSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// ===== METHODS =====
quizAttemptSchema.methods.finishAttempt = function (
  finalScore,
  finalPercentage
) {
  this.score = finalScore;
  this.percentage = finalPercentage;
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

// ===== STATICS =====
quizAttemptSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, updatedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
quizAttemptSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date() });
});

// Query middleware để loại bỏ deleted records
quizAttemptSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!("status" in this.getQuery())) {
      this.where({ status: { $ne: STATUS.DELETED } });
    }
  }
);

module.exports = model(DOCUMENT_NAME, quizAttemptSchema);
