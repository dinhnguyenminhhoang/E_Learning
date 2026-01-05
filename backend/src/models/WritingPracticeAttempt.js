"use strict";

const { Schema, model } = require("mongoose");

const writingPracticeAttemptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "WritingTemplate",
      required: false,
    },
    prompt: {
      type: String,
      required: false,
    },
    userText: {
      type: String,
      required: true,
    },
    feedback: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      grammarErrors: [{
        error: String,
        suggestion: String,
        position: Number,
      }],
      vocabularyFeedback: String,
      structureFeedback: String,
      overallFeedback: String,
    },
    grammarErrorCount: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "deleted"],
      default: "completed",
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "writing_practice_attempts",
  }
);

writingPracticeAttemptSchema.index({ user: 1, completedAt: -1 });
writingPracticeAttemptSchema.index({ user: 1, status: 1 });

const WritingPracticeAttempt = model(
  "WritingPracticeAttempt",
  writingPracticeAttemptSchema
);

module.exports = WritingPracticeAttempt;
