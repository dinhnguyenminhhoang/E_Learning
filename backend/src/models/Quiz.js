"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "Quiz";
const COLLECTION_NAME = "Quizzes";

const optionSchema = new Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    sourceType: {
      type: String,
      enum: ["Word", "Flashcard", "CardDeck"],
      required: false,
      default: null,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },

    type: {
      type: String,
      enum: ["multiple_choice", "fill_blank", "matching", "true_false", "writing", "speaking"],
      required: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [optionSchema],
      default: [],
    },

    correctAnswer: {
      type: String, 
      trim: true,
      default: null,
    },

    explanation: {
      type: String,
      trim: true,
      default: null,
    },

    points: {
      type: Number,
      min: 0,
      default: 1,
    },

    tags: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: String,
      trim: true,
      default: null,
    },

    audio: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: true }
);

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    skill: {
      type: String,
      enum: ["reading", "listening", "writing", "speaking", "grammar", "vocabulary"],
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    attachedTo: {
      kind: {
        type: String,
        enum: ["Lesson", "Module", "LearningPath"],
        required: true,
      },
      item: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "attachedTo.kind",
      },
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    xpReward: { type: Number, default: 50, min: 0 },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "EASY",
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.DRAFT,
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

module.exports = model(DOCUMENT_NAME, quizSchema);
