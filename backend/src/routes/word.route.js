"use strict";

const { Router } = require("express");
const wordController = require("../controllers/word.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const { validateCreateWord } = require("../middlewares/word");
const upload = require("../middlewares/upload");

const router = Router();
router.post(
  "/create",
  auth.authenticate,
  validateCreateWord,
  asynchandler(wordController.createWord)
);

router.get("/", auth.authenticate, asynchandler(wordController.getAllWord));
router.get("/:wordId", auth.authenticate, asynchandler(wordController.getWordById));
router.get(
  "/category/:categoryId",
  asynchandler(wordController.getWordsByCategory)
);
router.put(
  "/:wordId",
  auth.authenticate,
  validateCreateWord,
  asynchandler(wordController.updateWord)
);
router.delete(
  "/delete/:wordId",
  auth.authenticate,
  asynchandler(wordController.deleteWord)
);
router.post(
  "/import",
  auth.authenticate,
  upload.single("file"),
  asynchandler(wordController.importWords)
);
router.get(
  "/export-sample",
  auth.authenticate,
  asynchandler(wordController.exportSampleWords)
);
module.exports = router;
