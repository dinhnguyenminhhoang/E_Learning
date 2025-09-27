"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Flashcard";
const COLLECTION_NAME = "Flashcards";

const flashcardSchema = new Schema(
  {
    word: {
      type: Schema.Types.ObjectId,
      ref: "Word",
      required: true,
      index: true,
    },

    frontText: {
      type: String,
      required: [true, "Front text is required"],
      trim: true,
    },

    backText: {
      type: String,
      required: [true, "Back text is required"],
      trim: true,
    },

    cardDeck: {
      type: Schema.Types.ObjectId,
      ref: "CardDeck",
      required: true,
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
      index: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
flashcardSchema.index({ cardDeck: 1, difficulty: 1 });
flashcardSchema.index({ frontText: "text", backText: "text" });
flashcardSchema.index({ tags: 1 });

// ===== VIRTUALS =====
flashcardSchema.virtual("isHard").get(function () {
  return this.difficulty === "hard";
});

// ===== METHODS =====
flashcardSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

// ===== STATICS =====
flashcardSchema.statics.findByDeck = function (deckId) {
  return this.find({ cardDeck: deckId, status: "active", deletedAt: null });
};

flashcardSchema.statics.findByDifficulty = function (difficulty) {
  return this.find({ difficulty, status: "active", deletedAt: null });
};

// Search flashcards by text
flashcardSchema.statics.searchFlashcards = function (query, options = {}) {
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
flashcardSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date(), status: "inactive" });
});

// Query middleware loại bỏ deleted flashcards
flashcardSchema.pre(["find", "findOne", "findOneAndUpdate", "count", "countDocuments"], function () {
  if (!this.getQuery().deletedAt) {
    this.where({ deletedAt: null });
  }
});

module.exports = model(DOCUMENT_NAME, flashcardSchema);
