"use strict";

const Category = require("../models/Category");
class CategoryService {
  async searchCategories(query, options) {
    return await Category.searchCategories(query, options);
  }

  async createCategory(data) {
    const category = new Category(data);
    return await category.save();
  }

  async updateCategory(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
  }

  async getCategoryById(id) {
    return await Category.findById(id);
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) return null;

    category.deletedAt = new Date();
    await category.save();

    return true;
  }
}

module.exports = new CategoryService();
