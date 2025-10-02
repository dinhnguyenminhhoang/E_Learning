"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "UserOnboardingAnswer";
const COLLECTION_NAME = "UserOnboardingAnswers";

const userOnboardingAnswerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    questionKey: {
      type: String,
      required: true,
      enum: ["goals", "time_commitment", "learning_style"],
      index: true,
    },

    answer: {
      type: [String],
      default: [],
    },

    answeredAt: {
      type: Date,
      default: Date.now,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
userOnboardingAnswerSchema.index({ user: 1, questionKey: 1 }, { unique: true });

// ===== VIRTUALS =====
userOnboardingAnswerSchema.virtual("isAnswered").get(function () {
  return this.answer && this.answer.length > 0;
});

// ===== STATICS =====
userOnboardingAnswerSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, deletedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
userOnboardingAnswerSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

// Query middleware để loại bỏ deleted records
userOnboardingAnswerSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, userOnboardingAnswerSchema);
