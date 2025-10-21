const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const SKILL_ENUM = ["listening", "speaking", "reading", "writing"];
const LEVEL_ENUM = ["beginner", "intermediate", "advanced"];

const ContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["vocabulary", "grammar", "quiz"],
    },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    skill: { type: String, enum: SKILL_ENUM },
    difficulty: { type: String, enum: LEVEL_ENUM, default: "beginner" },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

const ContentBlock = model("ContentBlock", ContentBlockSchema);

module.exports = ContentBlock;
