"use strict";
const { model, Schema } = require("mongoose");
const exampleSchema = require("./subModel/example.schema");
const DOCUMENT_NAME = "Word";
const COLLECTION_NAME = "Words";

const wordSchema = new Schema(
  {
    word: {
      type: String,
      required: [true, "Word is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    pronunciation: {
      type: String,
      trim: true,
    },
    audio: {
      type: String, // URL to pronunciation audio
      trim: true,
    },
    partOfSpeech: {
      type: String,
      enum: [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "preposition",
        "conjunction",
        "interjection",
        "pronoun",
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },
    frequency: {
      type: Number,
      default: 0, // Tần suất sử dụng
      min: 0,
    },
    definitions: [
      {
        meaning: { type: String, required: true },
        meaningVi: { type: String, required: true }, // Nghĩa tiếng Việt
        examples: [exampleSchema],
      },
    ],
    synonyms: [{ type: String }],
    antonyms: [{ type: String }],
    relatedWords: [{ type: String }],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        index: true,
      },
    ],
    tags: [{ type: String }],
    image: { type: String }, // URL to image
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
wordSchema.index({
  word: "text",
  "definitions.meaning": "text",
  "definitions.meaningVi": "text",
});
wordSchema.index({ level: 1, isActive: 1 });
wordSchema.index({ categories: 1, level: 1 });
module.exports = model(DOCUMENT_NAME, wordSchema);
