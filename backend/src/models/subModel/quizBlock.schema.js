const mongoose = require("mongoose");
const { Schema } = mongoose;
const ContentBlock = require("./contentBlock.model");

const QuizBlock = ContentBlock.discriminator("quiz",
  new Schema({
    questions: [{
      q: { type: String, required: true },
      options: [String],
      answer: String
    }]
  })
);

module.exports = QuizBlock;
