"use strict";

const express = require("express");
const categoryController = require("../controllers/category.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post(
  "/",
  auth.adminOnly,
  asynchandler(categoryController.createCategory)
);

router.put(
  "/:id",
  auth.managerOrAdmin,
  asynchandler(categoryController.updateCategory)
);

router.get(
  "/",
  asynchandler(categoryController.listCategories),
);

router.get(
  "/:id",
  asynchandler(categoryController.getCategoryById),
);

router.delete(
  "/:id",
  auth.adminOnly,
  asynchandler(categoryController.deleteCategory)
);

module.exports = router;
