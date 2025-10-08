"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans"); 

const DOCUMENT_NAME = "AnswerMap";
const COLLECTION_NAME = "AnswerMaps";

const answerMapSchema = new Schema(
  {
    questionKey: {
      type: String,
      required: true,
      enum: ["GOALS", "LEVEL", "TIME_COMMITMENT", "LEARNING_STYLE"], 
      uppercase: true,
      index: true,
    },

    rawValue: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    target: {
      type: Schema.Types.ObjectId,
      ref: "Target",
      default: null,
      index: true,
    },

    learningPath: {
      type: Schema.Types.ObjectId,
      ref: "LearningPath",
      default: null,
      index: true,
    },

    normalizedValue: {
      type: String,
      trim: true,
      default: null,
    },

    mapType: {
      type: String,
      enum: ["target", "learning_path", "normalized"],
      default: "normalized",
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
  },
  {
    timestamps: true, 
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
  }
);

answerMapSchema.index({ questionKey: 1, rawValue: 1 }, { unique: true });
answerMapSchema.index({ mapType: 1, status: 1 });
answerMapSchema.index({ target: 1 });
answerMapSchema.index({ learningPath: 1 });

module.exports = model(DOCUMENT_NAME, answerMapSchema);
