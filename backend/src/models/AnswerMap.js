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
      enum: ["goals", "time_commitment", "learning_style"],
      index: true,
    },

    rawValue: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    target: {
      type: Schema.Types.ObjectId,
      ref: "Target",
      default: null,
      index: true,
    },

    normalizedValue: {
      type: String,
      trim: true,
      default: null,
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

// ===== INDEXES =====
answerMapSchema.index({ questionKey: 1, rawValue: 1 }, { unique: true });

// ===== VIRTUALS =====
answerMapSchema.virtual("isMapped").get(function () {
  return !!(this.target || this.normalizedValue);
});

// ===== STATICS =====
answerMapSchema.statics.findByRawValue = function (questionKey, rawValue) {
  return this.findOne({
    questionKey,
    rawValue,
    updatedAt: null,
  });
};

// ===== MIDDLEWARES =====
// Soft delete
answerMapSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date() });
});

// Query middleware để loại bỏ deleted records
answerMapSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!("status" in this.getQuery())) {
      this.where({ status: { $ne: STATUS.DELETED } });
    }
  }
);

module.exports = model(DOCUMENT_NAME, answerMapSchema);
