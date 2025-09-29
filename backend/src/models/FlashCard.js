"use strict";

require("./Word");
require("./CardDeck");
require("./User");

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

module.exports = model(DOCUMENT_NAME, flashcardSchema);
