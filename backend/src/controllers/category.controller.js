"use strict";

const categoryService = require("../services/category.service");

/**
 * Category Controller
 * Xử lý request/response cho Category
 */
class CategoryController {
  // GET /v1/api/category/search?q=keyword&limit=20&skip=0
  async searchCategories(req, res, next) {
    try {
      const { q, limit, skip } = req.query;

      if (!q) {
        return res.status(400).json({
          message: "Query parameter 'q' is required",
        });
      }

      const categories = await categoryService.searchCategories(q, {
        limit: parseInt(limit) || 20,
        skip: parseInt(skip) || 0,
      });

      return res.json({
        message: "Search successful",
        metadata: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /v1/api/category
  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      return res.status(201).json({
        message: "Category created successfully",
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /v1/api/category/:id
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(id, req.body);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.json({
        message: "Category updated successfully",
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /v1/api/category/:id
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.json({
        message: "Category fetched successfully",
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /v1/api/category/:id
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await categoryService.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.json({
        message: "Category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
