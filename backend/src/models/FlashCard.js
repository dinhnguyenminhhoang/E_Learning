"use strict";

require("./Word");
require("./CardDeck");
require("./User");

const { model, Schema, models } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

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

    // ===== MEDIA FIELDS =====
    images: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (url) {
            if (!url) return true;
            return /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/.test(
              url
            );
          },
          message: "Invalid image URL format",
        },
      },
    ],

    audio: {
      type: String,
      trim: true,
      validate: {
        validator: function (url) {
          if (!url) return true;
          return /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/.test(
            url
          );
        },
        message: "Invalid audio URL format",
      },
    },

    // ===== ADDITIONAL CONTENT =====
    hint: {
      type: String,
      trim: true,
      maxLength: [500, "Hint cannot exceed 500 characters"],
    },

    explanation: {
      type: String,
      trim: true,
      maxLength: [1000, "Explanation cannot exceed 1000 characters"],
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
flashcardSchema.index({ cardDeck: 1, difficulty: 1 });
flashcardSchema.index({ frontText: "text", backText: "text" });
flashcardSchema.index({ tags: 1 });
flashcardSchema.index({ createdBy: 1, status: 1 });
flashcardSchema.index({ studyCount: -1, viewCount: -1 }); // For popular cards

// ===== METHODS =====
flashcardSchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save();
};

flashcardSchema.methods.incrementStudy = function () {
  this.studyCount += 1;
  return this.save();
};

module.exports = models[DOCUMENT_NAME] || model(DOCUMENT_NAME, flashcardSchema);
