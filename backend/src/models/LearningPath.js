"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

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
    categories: [
      {
        categoryId: {
          // Ref Category (cha hoặc con)
          type: Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        selectedDecks: [
          {
            lessonId: {
              // Ref childCategory (lesson con) nếu cha
              type: Schema.Types.ObjectId,
              ref: "Category",
            },
            title: {
              type: String,
              trim: true,
              maxLength: 150,
            },
            selectedDeck: {
              // 1 deck duy nhất cho lesson này trong path
              type: Schema.Types.ObjectId,
              ref: "CardDeck",
              required: true,
            },
            // Optional: Lý do chọn (e.g., 'beginner')
            selectedLevel: {
              type: String,
              enum: ["beginner", "intermediate", "advanced"],
            },
            exercise: {
              type: Schema.Types.ObjectId,
              ref: "Quiz",
              required: false,
            },
          },
        ],
      },
    ],

    finalQuiz: { type: Schema.Types.ObjectId, ref: "Quiz" },
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

    updatedAt: {
      type: Date,
      default: null,
      index: true,
    },

    updatedBy: {
      type: String,
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
  return this.find({ status: "active", updatedAt: null });
};

learningPathSchema.statics.findByTarget = function (targetId) {
  return this.find({ target: targetId, status: "active", updatedAt: null });
};

learningPathSchema.statics.searchPaths = function (query, options = {}) {
  const { limit = 20, skip = 0 } = options;

  const searchQuery = {
    $text: { $search: query },
    status: "active",
    updatedAt: null,
  };

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// ===== MIDDLEWARES =====

// Soft delete
learningPathSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date(), status: "inactive" });
});

// Query middleware để loại bỏ deleted paths
// learningPathSchema.pre(
//   ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
//   function () {
//     if (!("status" in this.getQuery())) {
//       this.where({ status: { $ne: STATUS.DELETED } });
//     }
//   }
// );

module.exports = model(DOCUMENT_NAME, learningPathSchema);
