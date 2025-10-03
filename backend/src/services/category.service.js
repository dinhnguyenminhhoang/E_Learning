"use strict";

const categoryRepository = require("../repositories/category.repo");
const ResponseBuilder = require("../types/response/baseResponse");

class CategoryService {
  async createCategory(data) {
    const category = await categoryRepository.createCategory(data);
    return ResponseBuilder.success("Category created successfully", { category });
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.updateById(id, data);

    if (!category) {
      return ResponseBuilder.notFoundError("Category not found");
    }
    return ResponseBuilder.success("Category updated successfully", { category });
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      return ResponseBuilder.notFoundError("Category not found");
    }
    return ResponseBuilder.success("Fetch category successfully", { category });
  }

  async findAllCategories() {
    const category = await categoryRepository.findAllCategories();
    if (!category) {
      return ResponseBuilder.notFoundError("Category not found");
    }
    return ResponseBuilder.success("Fetch categories successfully", { category });
  }

  async deleteCategory(id) {
    const deleted = await categoryRepository.softDelete(id);
    if (!deleted) {
      return ResponseBuilder.notFoundError("Category not found");
    }
    return ResponseBuilder.success("Category deleted successfully");
  }
}

module.exports = new CategoryService();
