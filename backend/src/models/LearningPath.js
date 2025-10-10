"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "LearningPath";
const COLLECTION_NAME = "LearningPaths";

/** Level Schema */
const levelSchema = new Schema(
  {
    order: { type: Number, required: true, min: 1, index: true },
    title: { type: String, required: [true, "Level title is required"], trim: true, maxLength: 150 },
    categories: [
      {
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        // selectedDecks: 
        //   {
        //     lessonId: { type: Schema.Types.ObjectId, ref: "Category" },
        //     title: { type: String, trim: true, maxLength: 150 },
        //     selectedDeck: { type: Schema.Types.ObjectId, ref: "CardDeck", required: true },
        //     selectedLevel: { type: String, enum: ["beginner", "intermediate", "advanced"] },
        //     exercise: { type: Schema.Types.ObjectId, ref: "Quiz" },
        //   },

      },
    ],
    finalQuiz: { type: Schema.Types.ObjectId, ref: "Quiz" },
  },
  { _id: false }
);

/** LearningPath Schema */
const learningPathSchema = new Schema(
  {
    target: { type: Schema.Types.ObjectId, ref: "Target", required: true, index: true },

    // BẮT BUỘC – nhưng sẽ tự sinh nếu thiếu (xem middleware pre('validate') bên dưới)
    key: { type: String, unique: true, index: true, required: true, trim: true },

    title: { type: String, required: [true, "Learning path title is required"], trim: true, maxLength: 200 },
    description: { type: String, trim: true, maxLength: 2000 },

    // Trình độ tổng quát của lộ trình
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    thumbnail: { type: String, default: null },

    // Danh sách level con
    levels: {
      type: [levelSchema],
      validate: {
        validator(arr) {
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
    toJSON: { transform: (doc, ret) => ret },
    toObject: { transform: (doc, ret) => ret },
  }
);

/** Indexes */
learningPathSchema.index({ title: "text", description: "text" });
learningPathSchema.index({ target: 1, status: 1 });
learningPathSchema.index({ level: 1, status: 1 });
learningPathSchema.index({ createdAt: -1, status: 1 });

/** Virtuals */
learningPathSchema.virtual("levelCount").get(function () {
  return this.levels?.length || 0;
});

/** Methods */
learningPathSchema.methods.addLevel = function (level) {
  this.levels.push(level);
  return this.save();
};
learningPathSchema.methods.removeLevel = function (order) {
  this.levels = this.levels.filter((lvl) => lvl.order !== order);
  return this.save();
};

/** Statics */
learningPathSchema.statics.findActivePaths = function (filter = {}, options = {}) {
  return this.find({ status: STATUS.ACTIVE, ...filter }, null, options);
};
learningPathSchema.statics.findByTarget = function (targetId, options = {}) {
  return this.find({ target: targetId, status: STATUS.ACTIVE }, null, options);
};
learningPathSchema.statics.searchPaths = function (query, options = {}) {
  const { limit = 20, skip = 0 } = options;
  const searchQuery = { $text: { $search: query }, status: STATUS.ACTIVE };
  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

/** Middlewares */

// Tự sinh 'key' từ 'title' nếu thiếu. Ví dụ: "English Vocabulary Path A1" -> "english-vocabulary-path-a1"
learningPathSchema.pre("validate", function (next) {
  if (!this.key && this.title) {
    this.key = this.title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Soft delete: thay vì xóa, cập nhật status = DELETED (nếu có trong STATUS)
learningPathSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  this.status = STATUS.DELETED ?? "deleted";
  // updatedAt sẽ tự cập nhật nhờ timestamps
  this.save().then(() => next()).catch(next);
});

// (Tùy nhu cầu) Tự động bỏ qua DELETED trong các truy vấn list
// learningPathSchema.pre(["find", "findOne", "count", "countDocuments"], function () {
//   if (!("status" in this.getQuery())) {
//     this.where({ status: { $ne: STATUS.DELETED } });
//   }
// });

module.exports = model(DOCUMENT_NAME, learningPathSchema);
