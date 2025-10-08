"use strict";

const Category = require("../models/Category");
const { NotFoundError } = require("../core/error.response");
const { STATUS } = require("../constants/status.constans");
/**
 * Category Repository
 * Centralized data access layer cho Category operations
 * Implements Repository Pattern
 */
class CategoryRepository {
  constructor() {
    this.model = Category;
    this.defaultPopulate = [
      { path: "parentCategory", select: "name nameVi slug" },
      { path: "updatedBy", select: "name email" },
    ];
  }

  // ===== CREATE OPERATIONS =====

  /**
   * Tạo category mới
   * @param {Object} data - Category data
   * @returns {Promise<Object>} Created category
   */
  async createCategory(data) {
    try {
      const newCategory = new this.model(data);
      await newCategory.save();
      return newCategory;
    } catch (error) {
      console.error("❌ Error creating category:", error);
      throw error;
    }
  }

  // ===== READ OPERATIONS =====

  /**
   * Tìm category by ID
   * @param {string} id - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Category document
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
      console.error("❌ Error finding category by ID:", error);
      throw error;
    }
  }

  /**
   * @param {Object} options - Tùy chọn populate/lean
   * @returns {Promise<Array>} Categories
   */
  async findCategories(populate = false) {
    try {
      let query = this.model.find({ status: STATUS.ACTIVE });
      if (populate) query = query.populate(this.defaultPopulate);
      return await query.lean();
    } catch (error) {
      console.error("❌ Error fetching active categories:", error);
      throw error;
    }
  }

  /**
   * Tìm categories theo level
   * @param {string} level - beginner|intermediate|advanced
   * @returns {Promise<Array>} Categories
   */
  // async findByLevel(level) {
  //   try {
  //     return await this.model.find({
  //       level,
  //       status: STATUS.ACTIVE,
  //       updatedAt: null,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error finding categories by level:", error);
  //     throw error;
  //   }
  // }

  /**
   * @param {string} name - Category name
   * @returns {Promise<Object|null>} Category document
   */
  async getCategoryByName(name) {
    try {
      return await this.model.findOne({ name });
    } catch (error) {
      console.error("❌ Error finding category by name:", error);
      throw error;
    }
  }

  /**
   * Tìm category theo name hoặc slug
   * @param {string} name - Tên category
   * @param {string} slug - Slug category
   * @returns {Promise<Category|null>}
   */
  async findByNameOrSlug(name, slug) {
    return Category.findOne({
      $or: [{ name }, { slug }],
    }).lean();
  }

  /**
   * Search categories theo text index
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    try {
      const { limit = 20, skip = 0 } = options;

      const searchQuery = {
        $text: { $search: query },
        status: STATUS.ACTIVE,
        updatedAt: null,
      };


      return await this.model
        .find(searchQuery, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      console.error("❌ Error searching categories:", error);
      throw error;
    }
  }

  // ===== UPDATE OPERATIONS =====

  /**
   * Update category by ID
   * @param {string} id - Category ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated category
   */
  async updateById(id, data, options = {}) {
    try {
      const { populate = true, returnNew = true } = options;

      const updateOptions = {
        new: returnNew,
        runValidators: true,
      };

      let query = this.model.findByIdAndUpdate(id, data, updateOptions);

      if (populate) {
        query = query.populate(this.defaultPopulate);
      }

      const updatedCategory = await query.exec();

      if (!updatedCategory) {
        throw new NotFoundError("Category not found");
      }

      return updatedCategory;
    } catch (error) {
      console.error("❌ Error updating category:", error);
      throw error;
    }
  }

  /**
   * Increment word count
   * @param {string} id - Category ID
   * @param {number} count - Increment value
   * @returns {Promise<Object>} Updated category
   */
  async incrementWordCount(id, count = 1) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $inc: { wordCount: count } },
        { new: true }
      );
    } catch (error) {
      console.error("❌ Error incrementing word count:", error);
      throw error;
    }
  }

  /**
   * Decrement word count
   * @param {string} id - Category ID
   * @param {number} count - Decrement value
   * @returns {Promise<Object>} Updated category
   */
  async decrementWordCount(id, count = 1) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $inc: { wordCount: -count } },
        { new: true }
      );
    } catch (error) {
      console.error("❌ Error decrementing word count:", error);
      throw error;
    }
  }

  // ===== DELETE OPERATIONS =====

  /**
   * Soft delete category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Deleted category
   */
  async softDelete(id) {
    try {
      const deletedCategory = await this.model.findByIdAndUpdate(
        id,
        {
          updatedAt: new Date(),
          status: STATUS.INACTIVE,
        },
        { new: true }
      );

      if (!deletedCategory) {
        throw new NotFoundError("Category not found");
      }

      await this.model.updateMany(
        { parentCategory: id },
        { status: STATUS.INACTIVE, updatedAt: new Date() }
      );

      return deletedCategory;
    } catch (error) {
      console.error("❌ Error soft deleting category:", error);
      throw error;
    }
  }
}

module.exports = new CategoryRepository();
