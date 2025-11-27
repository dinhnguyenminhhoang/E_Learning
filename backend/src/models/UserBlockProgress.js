"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "UserBlockProgress";
const COLLECTION_NAME = "UserBlockProgresses";

const userBlockProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },

    block: {
      type: Schema.Types.ObjectId,
      ref: "ContentBlock",
      required: true,
      index: true,
    },

    blockOrder: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "locked"],
      default: "locked",
      index: true,
    },

    exerciseCompleted: {
      type: Boolean,
      default: false,
    },

    attempts: {
      type: Number,
      min: 0,
      default: 0,
    },

    lastAttemptScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    isLocked: {
      type: Boolean,
      default: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    timeSpent: {
      type: Number,
      default: 0,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    deletedBy: {
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

// ===== INDEXES =====
userBlockProgressSchema.index(
  { user: 1, lesson: 1, block: 1 },
  { unique: true }
);
userBlockProgressSchema.index({ user: 1, status: 1 });
userBlockProgressSchema.index({ lesson: 1, blockOrder: 1 });

// ===== VIRTUALS =====
userBlockProgressSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

userBlockProgressSchema.virtual("canProceed").get(function () {
  return this.exerciseCompleted || this.status === "completed";
});

// ===== METHODS =====
userBlockProgressSchema.methods.unlock = function () {
  this.isLocked = false;
  this.status = "not_started";
  return this.save();
};

userBlockProgressSchema.methods.start = function () {
  if (this.isLocked) {
    throw new Error("Block is locked. Complete previous block first.");
  }
  this.status = "in_progress";
  if (!this.startedAt) {
    this.startedAt = new Date();
  }
  return this.save();
};

userBlockProgressSchema.methods.complete = function () {
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

userBlockProgressSchema.methods.recordAttempt = function (score, isPassed) {
  this.attempts += 1;
  this.lastAttemptScore = score;
  if (isPassed) {
    this.exerciseCompleted = true;
    this.status = "completed";
    this.completedAt = new Date();
  }
  return this.save();
};

// ===== STATICS =====
userBlockProgressSchema.statics.findByUserAndLesson = function (
  userId,
  lessonId
) {
  return this.find({ user: userId, lesson: lessonId }).sort({
    blockOrder: 1,
  });
};

userBlockProgressSchema.statics.findByUserAndBlock = function (
  userId,
  blockId
) {
  return this.findOne({ user: userId, block: blockId });
};

userBlockProgressSchema.statics.getNextLockedBlock = function (
  userId,
  lessonId,
  currentBlockOrder
) {
  return this.findOne({
    user: userId,
    lesson: lessonId,
    blockOrder: currentBlockOrder + 1
  });
};

// ===== MIDDLEWARES =====
// Soft delete
userBlockProgressSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

module.exports = model(DOCUMENT_NAME, userBlockProgressSchema);
