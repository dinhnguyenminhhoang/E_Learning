"use strict";

const { model, Schema } = require("mongoose");
const { urlValidator } = require("../utils");
const { STATUS } = require("../constans/STATUS.constans");

const DOCUMENT_NAME = "CardDeck";
const COLLECTION_NAME = "CardDecks";

const cardDeckSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Deck title is required"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },

    target: {
      type: Schema.Types.ObjectId,
      ref: "Target",
      required: true,
      index: true,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    thumbnail: {
      type: String,
      trim: true,
      validate: {
        validator: urlValidator,
        message: "Thumbnail must be a valid URL",
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
cardDeckSchema.index({ title: "text", description: "text" });
cardDeckSchema.index({ target: 1, level: 1, status: 1 });
cardDeckSchema.index({ createdAt: -1, status: 1 });

// ===== VIRTUALS =====
cardDeckSchema.virtual("shortDescription").get(function () {
  return this.description?.length > 100
    ? this.description.substring(0, 100) + "..."
    : this.description;
});

// ===== METHODS =====
cardDeckSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// ===== STATICS =====
cardDeckSchema.statics.findActiveDecks = function () {
  return this.find({ status: "active", deletedAt: null });
};

cardDeckSchema.statics.findByTarget = function (targetId) {
  return this.find({ target: targetId, status: "active", deletedAt: null });
};

cardDeckSchema.statics.searchDecks = function (query, options = {}) {
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
cardDeckSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date(), status: "inactive" });
});

// Query middleware để loại bỏ deleted decks
cardDeckSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, cardDeckSchema);
