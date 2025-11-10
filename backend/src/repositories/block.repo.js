const BLOCK_MODELS = require("../constants/blocks");
const { STATUS } = require("../constants/status.constans");
const ContentBlock = require("../models/subModel/contentBlock.schema");
const GrammarBlock = require("../models/subModel/grammarBlock.schema");
const MediaBlock = require("../models/subModel/mediaBlock.schema");
const QuizBlock = require("../models/subModel/quizBlock.schema");
const VocabularyBlock = require("../models/subModel/VocabularyBlock.schema");
const { default: AppError } = require("../utils/appError");

class BlockRepository {
  async getBlockById(blockId) {
    const base = await ContentBlock.findById(blockId).where("status").ne(STATUS.DELETED);
    if (!base) return null;

    switch (base.type) {
      case "grammar":
        return await GrammarBlock.findById(blockId).where("status").ne(STATUS.DELETED);
      case "quiz":
        return await QuizBlock.findById(blockId).where("status").ne(STATUS.DELETED);
      case "vocabulary":
        return await VocabularyBlock.findById(blockId).where("status").ne(STATUS.DELETED).populate("cardDeck");
      default:
        return base;
    }
  }

  async create(blockData) {
    const Model = BLOCK_MODELS[blockData.type];
    if (!Model) {
      throw new AppError(`Unsupported block type: ${blockData.type}`);
    }
    return await Model.create(blockData);
  }

  async update(blockId, blockData) {
    const baseBlock = await ContentBlock.findById(blockId);
    if (!baseBlock) throw new AppError("Block not found", 404);

    const Model = BLOCK_MODELS[baseBlock.type];
    if (!Model) throw new AppError(`Unsupported block type: ${baseBlock.type}`);

    const { type, lessonId, ...updateData } = blockData;

    return await Model.findByIdAndUpdate(blockId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(blockId) {
    return ContentBlock.findByIdAndUpdate(blockId, { status: `${STATUS.DELETED}` });
  }

  async hardDelete(blockId) {
    return ContentBlock.findByIdAndDelete(blockId);
  }
}

module.exports = new BlockRepository();
