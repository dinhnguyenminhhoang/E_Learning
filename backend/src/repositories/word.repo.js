"use strict";

const Word = require("../models/Word");
const { NotFoundError } = require("../core/error.response");
const { STATUS } = require("../constants/status.constans");
const { default: AppError } = require("../utils/appError");

/**
 * Word Repository
 * Centralized data access layer cho Word operations
 * Implements Repository Pattern với caching và performance optimization
 */
class WordRepository {
  constructor() {
    this.model = Word;
    this.defaultPopulate = [
      { path: "categories", select: "name description" },
      { path: "createdBy", select: "name email" },
    ];
  }

  // ===== CREATE OPERATIONS =====

  /**
   * Tạo word mới
   * @param {Object} wordData - Word data
   * @returns {Promise<Object>} Created word
   */
  async createWord(wordData) {
    try {
      const newWord = new this.model(wordData);
      await newWord.save();

      return newWord;
    } catch (error) {
      throw error;
    }
  }

  // ===== READ OPERATIONS =====

  /**
   * Tìm word by ID
   * @param {string} id - Word ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Word document
   */
  async findById(id, options = {}) {
    try {
      const { populate = true, lean = false } = options;

      let query = this.model.findById(id);

      if (populate) {
        query = query.populate(this.defaultPopulate);
      }

      if (lean) {
        query = query.lean();
      }

      return await query.exec();
    } catch (error) {
      console.error("❌ Error finding word by ID:", error);
      throw error;
    }
  }
  /**
   * Tìm word by word text (case-insensitive)
   * @param {string} wordText - Word text
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Word document
   */
  async findByWordText(wordText, options = {}) {
    try {
      const { populate = false, lean = false } = options;

      let query = this.model.findOne({
        word: { $regex: new RegExp(`^${wordText}$`, "i") },
      });

      if (populate) {
        query = query.populate(this.defaultPopulate);
      }

      if (lean) {
        query = query.lean();
      }

      return await query.exec();
    } catch (error) {
      console.error("❌ Error finding word by text:", error);
      throw error;
    }
  }

  /**
   * Search words với filters và pagination
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results
   */
  async search(filters = {}, options = {}) {
    try {
      const {
        pageNum = 1,
        pageSize = 20,
        sort = "word",
        order = "asc",
        populate = true,
        lean = false,
        difficulty,
        isActive = true,
        query,
        level,
        partOfSpeech,
      } = options;

      const { categories } = filters;

      // Build search query
      const searchQuery = { isActive };

      // Text search
      if (query) {
        searchQuery.$or = [
          { word: { $regex: query, $options: "i" } },
          { "definitions.meaning": { $regex: query, $options: "i" } },
          { "definitions.meaningVi": { $regex: query, $options: "i" } },
        ];
      }

      // Level filter
      if (level) {
        searchQuery.level = level;
      }

      // Part of speech filter
      if (partOfSpeech) {
        searchQuery.partOfSpeech = partOfSpeech;
      }

      // Categories filter
      if (categories && categories.length > 0) {
        searchQuery.categories = { $in: categories };
      }

      // Difficulty filter
      if (difficulty) {
        searchQuery.difficulty = difficulty;
      }

      // Calculate pagination
      const skip = (pageNum - 1) * pageSize;
      const sortObj = { [sort]: order === "desc" ? -1 : 1 };

      // Execute query
      let query_builder = this.model
        .find(searchQuery)
        .where({ status: { $ne: STATUS.DELETED } })
        .sort(sortObj)
        .skip(skip)
        .limit(pageSize);

      if (populate) {
        query_builder = query_builder.populate(this.defaultPopulate);
      }

      if (lean) {
        query_builder = query_builder.lean();
      }

      const [words, total] = await Promise.all([
        query_builder.exec(),
        this.model.countDocuments(searchQuery),
      ]);

      return {
        words,
        pagination: {
          pageNum,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
          hasNext: pageNum < Math.ceil(total / pageSize),
          hasPrev: pageNum > 1,
        },
      };
    } catch (error) {
      console.error("❌ Error searching words:", error);
      throw error;
    }
  }

  /**
   * Get random words
   * @param {number} count - Number of words to get
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Random words
   */
  async getRandomWords(count = 10, filters = {}) {
    try {
      const { level, partOfSpeech, isActive = true } = filters;

      const matchQuery = { isActive };

      if (level) matchQuery.level = level;
      if (partOfSpeech) matchQuery.partOfSpeech = partOfSpeech;

      const words = await this.model.aggregate([
        { $match: matchQuery },
        { $sample: { size: count } },
        {
          $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categories",
          },
        },
      ]);

      return words;
    } catch (error) {
      console.error("❌ Error getting random words:", error);
      throw error;
    }
  }

  // ===== UPDATE OPERATIONS =====

  /**
   * Update word by ID
   * @param {string} id - Word ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated word
   */
  async updateById(id, updateData, options = {}) {
    try {
      const { populate = true, returnNew = true } = options;

      const updateOptions = {
        new: returnNew,
        runValidators: true,
      };

      let query = this.model.findByIdAndUpdate(id, updateData, updateOptions);

      if (populate) {
        query = query.populate(this.defaultPopulate);
      }

      const updatedWord = await query.exec();

      if (!updatedWord) {
        throw new NotFoundError("Word not found");
      }

      console.log(`✅ Updated word: ${updatedWord.word}`);
      return updatedWord;
    } catch (error) {
      console.error("❌ Error updating word:", error);
      throw error;
    }
  }

  /**
   * Increment word frequency
   * @param {string} id - Word ID
   * @param {number} increment - Increment value
   * @returns {Promise<Object>} Updated word
   */
  async incrementFrequency(id, increment = 1) {
    try {
      const updatedWord = await this.model.findByIdAndUpdate(
        id,
        { $inc: { frequency: increment } },
        { new: true, runValidators: true }
      );

      if (!updatedWord) {
        throw new NotFoundError("Word not found");
      }

      return updatedWord;
    } catch (error) {
      console.error("❌ Error incrementing word frequency:", error);
      throw error;
    }
  }

  // ===== DELETE OPERATIONS =====

  /**
   * Soft delete word
   * @param {string} id - Word ID
   * @returns {Promise<Object>} Deleted word
   */
  async softDelete(id) {
    try {
      const deletedWord = await this.model.findByIdAndUpdate(
        id,
        {
          status: STATUS.DELETED,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!deletedWord) {
        throw new NotFoundError("Word not found");
      }

      console.log(`🗑️ Soft deleted word: ${deletedWord.word}`);
      return deletedWord;
    } catch (error) {
      console.error("❌ Error soft deleting word:", error);
      throw error;
    }
  }

  /**
   * Hard delete word
   * @param {string} id - Word ID
   * @returns {Promise<Object>} Delete result
   */
  async hardDelete(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);

      if (!result) {
        throw new NotFoundError("Word not found");
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get word statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    try {
      const stats = await this.model.aggregate([
        {
          $facet: {
            totalWords: [{ $count: "count" }],
            activeWords: [{ $match: { isActive: true } }, { $count: "count" }],
            byLevel: [
              { $match: { isActive: true } },
              { $group: { _id: "$level", count: { $sum: 1 } } },
            ],
            byPartOfSpeech: [
              { $match: { isActive: true } },
              { $group: { _id: "$partOfSpeech", count: { $sum: 1 } } },
            ],
            averageFrequency: [
              { $match: { isActive: true } },
              { $group: { _id: null, avg: { $avg: "$frequency" } } },
            ],
          },
        },
      ]);

      return {
        totalWords: stats[0].totalWords[0]?.count || 0,
        activeWords: stats[0].activeWords[0]?.count || 0,
        byLevel: stats[0].byLevel,
        byPartOfSpeech: stats[0].byPartOfSpeech,
        averageFrequency: stats[0].averageFrequency[0]?.avg || 0,
      };
    } catch (error) {
      console.error("❌ Error getting word statistics:", error);
      throw error;
    }
  }

  /**
   * Bulk create words
   * @param {Array} wordsData - Array of word data
   * @returns {Promise<Array>} Created words
   */
  async bulkCreate(wordsData) {
    try {
      const createdWords = await this.model.insertMany(wordsData, {
        ordered: false, // Continue on error
        runValidators: true,
      });

      console.log(`✅ Bulk created ${createdWords.length} words`);
      return createdWords;
    } catch (error) {
      console.error("❌ Error bulk creating words:", error);
      throw error;
    }
  }

  async bulkWrite(ops) {
    try {
      return await this.model.bulkWrite(ops, { ordered: false });
    } catch (error) {
      console.error("❌ Bulk write error:", error);
      throw error;
    }
  }

  async find(filter = {}, projection = null, options = {}, lean = false) {
    try {
      let query = this.model.find(filter, projection, options);
      if (lean) {
        query = query.lean();
      }
      return await query;
    } catch (error) {
      console.error("❌ Error in WordRepository.find:", error);
      throw error;
    }
  }

  async getAllWords(req, res, next) {
    try {
      let {
        pageNum = 1,
        pageSize = 10,
        search = "",
        categories,
        level,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      pageNum = parseInt(pageNum);
      pageSize = parseInt(pageSize);

      const filter = {};

      if (search && search.trim()) {
        filter.$text = { $search: search.trim() };
      }

      if (categories) {
        const categoryList = Array.isArray(categories)
          ? categories
          : categories.split(",");
        filter.categories = { $in: categoryList };
      }

      if (level) {
        filter.level = level;
      }

      if (status) {
        filter.status = status;
      }

      const totalItems = await Word.countDocuments(filter);

      const skip = (pageNum - 1) * pageSize;

      const words = await Word.find(filter)
        .populate("categories", "name slug")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

      const totalPages = Math.ceil(totalItems / pageSize);

      const metadata = {
        pageNum,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      };

      return {
        metadata,
        data: words,
      };
    } catch (error) {
      console.error("Error in getAllWords:", error);
      throw new AppError("Internal server error", 500);
    }
  }
}

module.exports = new WordRepository();
