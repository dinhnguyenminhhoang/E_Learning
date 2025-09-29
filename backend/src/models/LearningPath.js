"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constans/STATUS.constans");

const DOCUMENT_NAME = "LearningPath";
const COLLECTION_NAME = "LearningPaths";

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
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { _id: false }
);

const learningPathSchema = new Schema(
  {
    target: {
      type: Schema.Types.ObjectId,
      ref: "Target",
      required: true,
      index: true,
    },

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

    levels: {
      type: [levelSchema],
      validate: {
        validator: function (arr) {
          // order phải là duy nhất trong levels
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
    toJSON: {
      transform: function (doc, ret) {
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        return ret;
      },
    },
  }
);

// ===== INDEXES =====
learningPathSchema.index({ title: "text", description: "text" });
learningPathSchema.index({ target: 1, status: 1 });
learningPathSchema.index({ createdAt: -1, status: 1 });

// ===== VIRTUALS =====
learningPathSchema.virtual("levelCount").get(function () {
  return this.levels?.length || 0;
});

// ===== METHODS =====
learningPathSchema.methods.addLevel = function (level) {
  this.levels.push(level);
  return this.save();
};

learningPathSchema.methods.removeLevel = function (order) {
  this.levels = this.levels.filter((lvl) => lvl.order !== order);
  return this.save();
};

// ===== STATICS =====
learningPathSchema.statics.findActivePaths = function () {
  return this.find({ status: "active", deletedAt: null });
};

learningPathSchema.statics.findByTarget = function (targetId) {
  return this.find({ target: targetId, status: "active", deletedAt: null });
};

learningPathSchema.statics.searchPaths = function (query, options = {}) {
  const { limit = 20, skip = 0 } = options;

  const searchQuery = {
    $text: { $search: query },
    status: "active",
    deletedAt: null,
  };

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// ===== MIDDLEWARES =====

// Soft delete
learningPathSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date(), status: "inactive" });
});

// Query middleware để loại bỏ deleted paths
learningPathSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, learningPathSchema);
