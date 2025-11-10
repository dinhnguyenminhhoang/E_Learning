const GrammarBlock = require("../models/subModel/grammarBlock.schema");
const MediaBlock = require("../models/subModel/mediaBlock.schema");
const QuizBlock = require("../models/subModel/quizBlock.schema");
const VocabularyBlock = require("../models/subModel/VocabularyBlock.schema");

const BLOCK_MODELS = {
  grammar: GrammarBlock,
  vocabulary: VocabularyBlock,
  quiz: QuizBlock,
  media: MediaBlock,
};

module.exports = BLOCK_MODELS;
