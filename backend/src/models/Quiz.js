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
      required: true,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    type: {
      type: String,
      enum: ["multiple_choice", "fill_blank", "matching", "true_false"],
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
      type: String, // dành cho fill_blank hoặc true_false
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

    questions: {
      type: [questionSchema],
      default: [],
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

// ===== VIRTUALS =====
quizSchema.virtual("questionCount").get(function () {
  return this.questions?.length || 0;
});

// ===== METHODS =====
quizSchema.methods.addQuestion = function (question) {
  this.questions.push(question);
  return this.save();
};

// ===== STATICS =====
quizSchema.statics.findActive = function () {
  return this.find({ updatedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
quizSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date() });
});

// Query middleware để loại bỏ deleted records
quizSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!("status" in this.getQuery())) {
      this.where({ status: { $ne: STATUS.DELETED } });
    }
  }
);

module.exports = model(DOCUMENT_NAME, quizSchema);
