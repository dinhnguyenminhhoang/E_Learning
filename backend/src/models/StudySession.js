"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "StudySession";
const COLLECTION_NAME = "StudySessions";

const studySessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["flashcard", "quiz", "mixed"],
      required: true,
      index: true,
    },

    learningPath: {
      type: Schema.Types.ObjectId,
      ref: "UserLearningPath",
      default: null,
      index: true,
    },

    duration: {
      type: Number,
      default: 0, // tổng thời gian (giây hoặc phút)
      min: 0,
    },

    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    pointsEarned: {
      type: Number,
      min: 0,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
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
studySessionSchema.index({ user: 1, type: 1, startedAt: -1 });

// ===== VIRTUALS =====
studySessionSchema.virtual("isCompleted").get(function () {
  return !!this.endedAt;
});

// ===== METHODS =====
studySessionSchema.methods.endSession = function (duration, accuracy, points) {
  this.duration = duration;
  this.accuracy = accuracy;
  this.pointsEarned = points;
  this.endedAt = new Date();
  return this.save();
};

// ===== STATICS =====
studySessionSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId, deletedAt: null }).sort({ startedAt: -1 });
};

// ===== MIDDLEWARES =====
// Soft delete
studySessionSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

// Query middleware để loại bỏ deleted records
studySessionSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, studySessionSchema);
