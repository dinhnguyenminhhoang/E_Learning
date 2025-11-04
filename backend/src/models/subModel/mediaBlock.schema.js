const { Schema } = require("mongoose");
const ContentBlock = require("./contentBlock.schema");

const MediaBlock = ContentBlock.discriminator(
  "media",
  new Schema({
    mediaType: { type: String, enum: ["audio", "video"], required: true },
    sourceType: {
      type: String,
      enum: ["upload", "youtube"],
      default: "upload",
    },
    sourceUrl: { type: String, required: true },
    transcript: { type: String },
    tasks: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  })
);

module.exports = MediaBlock;
