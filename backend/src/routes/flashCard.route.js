"use strict";

const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const { validateCreateFlashcard } = require("../middlewares/flashCard");
const auth = require("../middlewares/auth");
const flashcardController = require("../controllers/flashCard.controller");

const router = Router();

// Tạo flashcard
router.post(
  "/create",
  auth.adminOnly,
  validateCreateFlashcard,
  asynchandler(flashcardController.create)
);

// Lấy danh sách flashcard
router.get(
  "/",
  asynchandler(flashcardController.list)
);

// Lấy flashcard theo id
router.get(
  "/getById/:id",
  asynchandler(flashcardController.getOne)
);

// Cập nhật flashcard
router.put(
  "/:id",
  auth.adminOnly,
  validateCreateFlashcard,
  asynchandler(flashcardController.update)
);

// Xóa flashcard
router.delete(
  "/delete/:id",
  auth.adminOnly,
  asynchandler(flashcardController.delete)
);

module.exports = router;
