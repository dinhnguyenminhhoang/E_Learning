"use strict";

const categoryService = require("../services/category.service");

class CategoryController {
  
  async createCategory(req, res) {
    const category = await categoryService.createCategory(req.body);
    return res.status(category.code).json(category);
  }

  async listCategories(req, res) {
    const categories = await categoryService.findAllCategories(req.query);
    return res.status(categories.code).json(categories);
  }

  async getCategoryById(req, res) {
    const category = await categoryService.getCategoryById(req.params.id);
    return res.status(category.code).json(category);
  }

  async updateCategory(req, res) {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );
    return res.status(category.code).json(category);
  }

  async deleteCategory(req, res, next) {
    const result = await categoryService.deleteCategory(req.params.id);
    return res.status(result.code).json(result);
  }
}

module.exports = new CategoryController();
