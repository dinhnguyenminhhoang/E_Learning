const BLOCK_MODELS = require("../constants/blocks");
const { STATUS } = require("../constants/status.constans");
const ContentBlock = require("../models/subModel/contentBlock.schema");
const GrammarBlock = require("../models/subModel/grammarBlock.schema");
const MediaBlock = require("../models/subModel/mediaBlock.schema");
const QuizBlock = require("../models/subModel/quizBlock.schema");
const VocabularyBlock = require("../models/subModel/VocabularyBlock.schema");
const { default: AppError } = require("../utils/appError");

class BlockRepository {
  async findOne(filter = {}) {
    return ContentBlock.findOne(filter).where("status").ne(STATUS.DELETED);
  }

  async getBlockById(blockId) {
    const base = await ContentBlock.findById(blockId).where("status").ne(STATUS.DELETED);
    if (!base) return null;

    switch (base.type) {
      case "grammar":
        return await GrammarBlock.findById(blockId)
          .where("status")
          .ne(STATUS.DELETED)
          .populate("lessonId", "title skill");
      case "quiz":
        return await QuizBlock.findById(blockId)
          .where("status")
          .ne(STATUS.DELETED)
          .populate("lessonId", "title skill");
      case "vocabulary":
        return await VocabularyBlock.findById(blockId)
          .where("status")
          .ne(STATUS.DELETED)
          .populate("cardDeck")
          .populate("lessonId", "title skill");
      case "media":
        return await MediaBlock.findById(blockId)
          .where("status")
          .ne(STATUS.DELETED)
          .populate("lessonId", "title skill");
      default:
        return base.populate("lessonId", "title skill");
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
  async getBlocksByLesson(lessonId) {
    const blocks = await ContentBlock.find({ lessonId: lessonId }).where("status").ne(STATUS.DELETED).sort({ order: 1 });
    return blocks;
  }

  async getAllBlocks(filters = {}, pagination = {}) {
    const { type, skill, difficulty, status, lessonId, search } = filters;
    const { pageNum = 1, pageSize = 20 } = pagination;

    const query = { status: { $ne: STATUS.DELETED } };

    if (type) query.type = type;
    if (skill) query.skill = skill;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (lessonId) query.lessonId = lessonId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (pageNum - 1) * pageSize;

    const [blocks, total] = await Promise.all([
      ContentBlock.find(query)
        .populate("lessonId", "title skill")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ContentBlock.countDocuments(query),
    ]);

    return { blocks, total, pageNum, pageSize };
  }

  async countBlocks(filters = {}) {
    const query = { status: { $ne: STATUS.DELETED } };
    if (filters.type) query.type = filters.type;
    if (filters.skill) query.skill = filters.skill;
    if (filters.status) query.status = filters.status;

    return await ContentBlock.countDocuments(query);
  }
}

module.exports = new BlockRepository();
