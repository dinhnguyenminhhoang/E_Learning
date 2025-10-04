"use strict";

const categoryService = require("../services/category.service");

class CategoryController {
  // POST /v1/api/category
  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);

      if (category.status === "error") {
        return res.status(category.code).json(category);
      }

      return res.status(201).json({
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /v1/api/category/search?q=keyword&limit=20&skip=0
  async listCategories(req, res, next) {
    try {
      const categories = await categoryService.findAllCategories(req.query);

      if (categories.status === "error") {
        return res.status(categories.code).json(categories);
      }

      return res.json({
        metadata: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /v1/api/category/:id
  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);

      if (category.status === "error") {
        return res.status(category.code).json(category);
      }

      return res.json({
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /v1/api/category/:id
  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(
        req.params.id,
        req.body
      );

      if (category.status === "error") {
        return res.status(category.code).json(category);
      }

      return res.json({
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /v1/api/category/:id
  async deleteCategory(req, res, next) {
    try {
      const result = await categoryService.deleteCategory(req.params.id);

      if (result.status === "error") {
        return res.status(result.code || 400).json(result);
      }

      return res.json({
        metadata: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
