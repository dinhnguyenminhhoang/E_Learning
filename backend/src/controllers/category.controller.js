"use strict";

const categoryService = require("../services/category.service");

class CategoryController {

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

  // GET /v1/api/category/search?q=keyword&limit=20&skip=0
  async listCategories(req, res, next) {
    console.log("req.query:", req.query);
    try {
      const categories = await categoryService.findAllCategories(req.query);
      return res.json({
        message: "Search successful",
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
      return res.json({
        message: "Category fetched successfully",
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
      return res.json({
        message: "Category updated successfully",
        metadata: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /v1/api/category/:id
  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      return res.json({ message: "Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
