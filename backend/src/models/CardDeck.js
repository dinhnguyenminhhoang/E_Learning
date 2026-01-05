"use strict";

const { model, Schema } = require("mongoose");
const { urlValidator } = require("../utils");
const { STATUS } = require("../constants/status.constans");

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
      required: false,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    categoryId: {
      // Ref Category con (lesson)
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true, // Bắt buộc thuộc 1 lesson
      index: true,
    },

    thumbnail: {
      type: String,
      trim: true,
      validate: {
        validator: urlValidator,
        message: "Thumbnail must be a valid URL",
      },
    },

    // ===== CLASSIFICATION =====
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ===== STATISTICS =====
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    studyCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    cardCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===== STATUS & METADATA =====
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: null,
      index: true,
    },

    updatedBy: {
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
cardDeckSchema.index({ createdBy: 1, isPublic: 1, status: 1 });
cardDeckSchema.index({ studyCount: -1, viewCount: -1 }); // For popular decks
cardDeckSchema.index({ tags: 1 });

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

cardDeckSchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save();
};

cardDeckSchema.methods.incrementStudy = function () {
  this.studyCount += 1;
  return this.save();
};

cardDeckSchema.methods.updateCardCount = async function () {
  const Flashcard = require("./FlashCard");
  const count = await Flashcard.countDocuments({
    cardDeck: this._id,
    status: "active",
  });
  this.cardCount = count;
  return this.save();
};

// ===== STATICS =====
cardDeckSchema.statics.findActiveDecks = function () {
  return this.find({ status: "active", updatedAt: null });
};

cardDeckSchema.statics.findByTarget = function (targetId) {
  return this.find({ target: targetId, status: "active", updatedAt: null });
};

cardDeckSchema.statics.searchDecks = function (query, options = {}) {
  const { limit = 20, skip = 0, level = null } = options;

  const searchQuery = {
    $text: { $search: query },
    status: "active",
    updatedAt: null,
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
  this.updateOne({}, { updatedAt: new Date(), status: "inactive" });
});

// // Query middleware để loại bỏ deleted decks
// cardDeckSchema.pre(
//   ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
//   function () {
//     if (!("status" in this.getQuery())) {
//       this.where({ status: { $ne: STATUS.DELETED } });
//     }
//   }
// );

module.exports = model(DOCUMENT_NAME, cardDeckSchema);
