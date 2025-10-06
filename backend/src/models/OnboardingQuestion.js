"use strict";

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const DOCUMENT_NAME = "OnboardingQuestion";
const COLLECTION_NAME = "OnboardingQuestions";

const optionSchema = new Schema({
  key: { type: String, uppercase: true },
  label: { type: String },
  icon: { type: String },
  description: { type: String },
});

const questionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    title: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ["single", "multiple"],
      default: "single",
      index: true,
    },
    options: [optionSchema],
    order: { type: Number },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: COLLECTION_NAME,
  }
);

questionSchema.index({ order: 1, isActive: 1 }); // compound index
questionSchema.index({ title: "text", description: "text" }); // full-text search

module.exports = mongoose.models[DOCUMENT_NAME] || model(DOCUMENT_NAME, questionSchema);
