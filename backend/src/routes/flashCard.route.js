"use strict";

const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const { validateCreateFlashcard, validateUpdateFlashcard } = require("../middlewares/flashCard");
const auth = require("../middlewares/auth");
const flashcardController = require("../controllers/flashCard.controller");

const router = Router();

// Tạo flashcard
router.post(
  "/create",
  // auth.authenticate,
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
  // auth.authenticate,
  validateUpdateFlashcard,
  asynchandler(flashcardController.update)
);

// Xóa flashcard
router.delete(
  "/delete/:id",
  // auth.authenticate,
  asynchandler(flashcardController.delete)
);

module.exports = router;
