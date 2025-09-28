"use strict";

const { model, Schema } = require("mongoose");
const { urlValidator } = require("../utils");

const DOCUMENT_NAME = "Category";
const COLLECTION_NAME = "Categories";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name (EN) is required"],
      trim: true,
      unique: true,
      index: true,
      maxLength: 150,
    },

    nameVi: {
      type: String,
      required: [true, "Category name (VI) is required"],
      trim: true,
      maxLength: 150,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },

    icon: {
      type: String,
      trim: true,
      validate: {
        validator: urlValidator,
        message: "Icon must be a valid URL",
      },
    },

    color: {
      type: String,
      trim: true,
      match: /^#([0-9A-Fa-f]{3}){1,2}$/, // validate mã màu hex
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
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
categorySchema.index({ name: "text", nameVi: "text", description: "text" });
categorySchema.index({ parentCategory: 1, status: 1 });
categorySchema.index({ createdAt: -1, status: 1 });

// ===== VIRTUALS =====
categorySchema.virtual("isRoot").get(function () {
  return this.parentCategory === null;
});

// ===== METHODS =====
categorySchema.methods.incrementWordCount = function (count = 1) {
  this.wordCount += count;
  return this.save();
};

categorySchema.methods.decrementWordCount = function (count = 1) {
  this.wordCount = Math.max(0, this.wordCount - count);
  return this.save();
};

categorySchema.statics.searchCategories = function (query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    status = "active",
    level = null,
    parentCategory = null,
  } = options;

  const searchQuery = {
    $text: { $search: query },
    status,
    deletedAt: null,
  };

  if (level) {
    searchQuery.level = level;
  }

  if (parentCategory) {
    searchQuery.parentCategory = parentCategory;
  }

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};


// ===== STATICS =====
categorySchema.statics.findActiveCategories = function () {
  return this.find({ status: "active", deletedAt: null });
};

categorySchema.statics.findByLevel = function (level) {
  return this.find({ level, status: "active", deletedAt: null });
};

// Search categories
categorySchema.statics.searchCategories = function (query, options = {}) {
  const { limit = 20, skip = 0, level = null } = options;

  const searchQuery = {
    $text: { $search: query },
    status: "active",
    deletedAt: null,
  };

  if (level) searchQuery.level = level;

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// ===== MIDDLEWARES =====

// Soft delete
categorySchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date(), status: "inactive" });
});

// Query middleware để loại bỏ deleted categories
categorySchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, categorySchema);
