"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "UserOnboardingAnswer";
const COLLECTION_NAME = "UserOnboardingAnswers";

const QUESTION_KEYS = ["GOALS", "TIME_COMMITMENT", "LEARNING_STYLE", "LEVEL"];

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
      enum: QUESTION_KEYS,
      uppercase: true,
      index: true,
    },

    answerKeys: {
      type: [String],
      default: [],
      set: (v) => v.map((key) => key.toUpperCase()),
    },

    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
  }
);

userOnboardingAnswerSchema.index({ user: 1, questionKey: 1 }, { unique: true });

module.exports = model(DOCUMENT_NAME, userOnboardingAnswerSchema);
