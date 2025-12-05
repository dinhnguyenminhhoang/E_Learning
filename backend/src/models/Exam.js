"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "Exam";
const COLLECTION_NAME = "Exams";

const examSectionSchema = new Schema(
  {
    title: {
      type: String, // Reading, Listening, Grammar, Vocabulary...
      required: true,
      trim: true,
    },

    skill: {
      type: String, 
      enum: ["reading", "listening", "writing", "speaking", "grammar", "vocabulary"],
      required: true,
      lowercase: true,
    },

    order: {
      type: Number,
      min: 1,
      required: true,
    },

    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    timeLimit: {
      type: Number, // tính theo giây
      min: 0,
      default: null, // null = không giới hạn (ví dụ Writing)
    },
  },
  { _id: true }
);

const examSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.DRAFT,
      index: true,
    },

    totalTimeLimit: {
      type: Number, // nếu muốn giới hạn toàn bộ exam
      min: 0,
      default: null,
    },

    sections: {
      type: [examSectionSchema],
      default: [],
    },

    updatedBy: {
      type: String,
      default: null,
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

module.exports = model(DOCUMENT_NAME, examSchema);
