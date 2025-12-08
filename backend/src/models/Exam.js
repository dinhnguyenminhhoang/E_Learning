"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");
const AppError = require("../utils/appError");
const HTTP_STATUS = require("../constants/httpStatus");
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
      enum: [
        "reading",
        "listening",
        "writing",
        "speaking",
        "grammar",
        "vocabulary",
      ],
      required: true,
      lowercase: true,
    },

    maxScore: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
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

    maxScore: {
      type: Number,
      min: 0,
      default: 100,
      index: true,
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
// ============================================================
// 👇 MIDDLEWARE VALIDATE: Tổng điểm Section == MaxScore Exam 👇
// ============================================================

examSchema.pre("save", function (next) {
  // 1. Chỉ chạy logic này nếu có thay đổi liên quan đến điểm số
  if (!this.isModified("sections") && !this.isModified("maxScore")) {
    return next();
  }

  // 2. Tính tổng maxScore của tất cả các section con
  const currentTotalSectionScore = this.sections.reduce((sum, section) => {
    return sum + (section.maxScore || 0);
  }, 0);

  // 3. So sánh với maxScore của Exam
  if (currentTotalSectionScore !== this.maxScore) {
    const error = new AppError(
      `Validation Error: Tổng điểm các sections (${currentTotalSectionScore}) không khớp với tổng điểm Exam (${this.maxScore}). Vui lòng điều chỉnh lại điểm số.`,
      HTTP_STATUS.BAD_REQUEST
    );
    // Trả về lỗi, Mongoose sẽ dừng quá trình save và throw error ra controller
    return next(error);
  }

  // 4. Nếu khớp thì cho qua
  next();
});
module.exports = model(DOCUMENT_NAME, examSchema);
