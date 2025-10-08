"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "LearningPath";
const COLLECTION_NAME = "LearningPaths";

/**
 * 🔹 Level Schema: Đại diện cho từng cấp trong lộ trình học
 * Mỗi level có thể chứa nhiều "Lesson" (ref → Category hoặc Quiz)
 */
const levelSchema = new Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Level title is required"],
      trim: true,
      maxLength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },

    // Liên kết tới bài học (Category con hoặc Lesson)
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // Quiz kiểm tra ở cuối level
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { _id: false }
);

/**
 * 🔹 LearningPath Schema: Đại diện 1 lộ trình học (ví dụ: “Travel English”)
 */
const learningPathSchema = new Schema(
  {
    target: {
      type: Schema.Types.ObjectId,
      ref: "Target",
      required: true,
      index: true,
    },

    key: { type: String, unique: true, index: true, required: true },

    title: {
      type: String,
      required: [true, "Learning path title is required"],
      trim: true,
      maxLength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 2000,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    thumbnail: {
      type: String,
      default: null,
    },

    levels: {
      type: [levelSchema],
      validate: {
        validator: function (arr) {
          const orders = arr.map((l) => l.order);
          return new Set(orders).size === orders.length;
        },
        message: "Each level must have a unique order",
      },
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => ret,
    },
    toObject: {
      transform: (doc, ret) => ret,
    },
  }
);

learningPathSchema.index({ title: "text", description: "text" });
learningPathSchema.index({ target: 1, status: 1 });
learningPathSchema.index({ level: 1, status: 1 });
learningPathSchema.index({ createdAt: -1, status: 1 });

module.exports = model(DOCUMENT_NAME, learningPathSchema);
