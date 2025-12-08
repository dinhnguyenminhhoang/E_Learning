const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContentBlock = require("./contentBlock.schema");

const GrammarBlock = ContentBlock.discriminator(
  "grammar",
  new Schema({
    topic: { type: String, required: true },
    explanation: { type: String, required: true },
    examples: [{ type: String }],
    videoUrl: { type: String },
    sourceType: {
      type: String,
      enum: ["upload", "youtube"],
      default: "upload",
    },
    duration: { type: Number, default: 0 },
  })
);

module.exports = GrammarBlock;
