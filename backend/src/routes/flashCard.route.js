"use strict";

const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const { validateCreateFlashcard, validateUpdateFlashcard } = require("../middlewares/flashCard");
const flashcardController = require("../controllers/flashCard.controller");

const router = Router();

router.post("/create", validateCreateFlashcard, asynchandler(flashcardController.create));
router.get("/", asynchandler(flashcardController.list));
router.get("/getById/:id", asynchandler(flashcardController.getOne));
router.put("/:id", validateUpdateFlashcard, asynchandler(flashcardController.update));
router.delete("/delete/:id", asynchandler(flashcardController.delete));

// ===== STATISTICS ROUTES =====
router.post("/:id/increment-view", asynchandler(flashcardController.incrementView));
router.post("/:id/increment-study", asynchandler(flashcardController.incrementStudy));

module.exports = router;
