"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "ExamAttempt";
const COLLECTION_NAME = "ExamAttempts";

const sectionAttemptSchema = new Schema(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    quizAttempt: {
      type: Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    timeSpent: {
      type: Number,
      min: 0,
      default: 0,
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
  },
  { _id: false }
);

const examAttemptSchema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sections: {
      type: [sectionAttemptSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      index: true,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    totalPercentage: {
      type: Number,
      default: 0,
    },

    totalTimeSpent: {
      type: Number,
      default: 0,
    },

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },

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

module.exports = model(DOCUMENT_NAME, examAttemptSchema);
