"use strict";

const categoryRepository = require("../repositories/category.repo");

class CategoryService {
  async createCategory(data) {
    return await categoryRepository.createCategory(data);
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.updateById(id, data);

    if (!category) {
      const err = new Error("Category not found");
      err.status = 404;
      throw err;
    }
    return category;
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const err = new Error("Category not found");
      err.status = 404;
      throw err;
    }
    return category;
  }

  async findAllCategories() {
    const category = await categoryRepository.findAllCategories();
    if (!category) {
      const err = new Error("Category not found");
      err.status = 404;
      throw err;
    }
    return category;
  }

  async deleteCategory(id) {
    const deleted = await categoryRepository.softDelete(id);
    if (!deleted) {
      const err = new Error("Category not found");
      err.status = 404;
      throw err;
    }
    return true;
  }
}

module.exports = new CategoryService();
