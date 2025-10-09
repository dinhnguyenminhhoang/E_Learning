"use strict";

const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const { validateCreateCategory } = require("../middlewares/category");
const auth = require("../middlewares/auth");

const router = Router();

// Tạo category
router.post(
  "/create",
  // auth.authenticate,
  validateCreateCategory,
  asynchandler(categoryController.createCategory)
);

// Cập nhật category
router.put(
  "/:id",
  // auth.authenticate,
  validateCreateCategory,
  asynchandler(categoryController.updateCategory)
);

// Lấy danh sách category
router.get(
  "/",
  asynchandler(categoryController.listCategories)
);

// Lấy category theo id
router.get(
  "/getById/:id",
  asynchandler(categoryController.getCategoryById)
);

// Xóa category
router.delete(
  "/delete/:id",
  // auth.authenticate,
  asynchandler(categoryController.deleteCategory)
);

module.exports = router;
