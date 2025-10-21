const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContentBlock = require("./contentBlock.model");

const GrammarBlock = ContentBlock.discriminator("grammar",
  new Schema({
    topic: { type: String, required: true },
    rules: [String],
    examples: [String]
  })
);

module.exports = GrammarBlock;
