const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContentBlock = require("./contentBlock.model");

const VocabularyBlock = ContentBlock.discriminator("vocabulary",
  new Schema({
    cardDeck: {
      type: Schema.Types.ObjectId,
      ref: "CardDeck",
      required: true
    }
  })
);

module.exports = VocabularyBlock;
