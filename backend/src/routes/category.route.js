"use strict";

const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const { validateCreateCategory } = require("../middlewares/category");

const router = Router();

router.post("/create", validateCreateCategory, asynchandler(categoryController.createCategory));
router.put("/:id", validateCreateCategory, asynchandler(categoryController.updateCategory));
router.get("/", asynchandler(categoryController.listCategories));
router.get("/getById/:id", asynchandler(categoryController.getCategoryById));
router.delete("/delete/:id", asynchandler(categoryController.deleteCategory));

module.exports = router;
