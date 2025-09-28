"use strict";

const express = require("express");
const categoryController = require("../controllers/category.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post(
  "/",
  auth.adminOnly, // chỉ ADMIN mới tạo được category
  asynchandler(categoryController.createCategory)
);

router.put(
  "/:id",
  auth.managerOrAdmin, // MANAGER hoặc ADMIN mới được update
  asynchandler(categoryController.updateCategory)
);

router.get(
  "/:id",
  asynchandler(categoryController.getCategoryById)
);

router.delete(
  "/:id",
  auth.adminOnly, // chỉ ADMIN mới được xóa
  asynchandler(categoryController.deleteCategory)
);

module.exports = router;
