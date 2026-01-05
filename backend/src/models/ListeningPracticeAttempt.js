"use strict";

const { Schema, model } = require("mongoose");

const listeningPracticeAttemptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: "MediaBlock",
      required: false,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
    mediaTitle: {
      type: String,
      required: false,
    },
    questions: [{
      question: String,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
    }],
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    duration: {
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
    collection: "listening_practice_attempts",
  }
);

listeningPracticeAttemptSchema.index({ user: 1, completedAt: -1 });
listeningPracticeAttemptSchema.index({ user: 1, status: 1 });

const ListeningPracticeAttempt = model(
  "ListeningPracticeAttempt",
  listeningPracticeAttemptSchema
);

module.exports = ListeningPracticeAttempt;
