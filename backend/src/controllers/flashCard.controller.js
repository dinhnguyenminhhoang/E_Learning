"use strict";

const flashcardService = require("../services/flashCard.service");

class FlashcardController {
  async create(req, res) {
    const userId = req.user?._id || req.userId;
    const flashcard = await flashcardService.createFlashcard(req.body, userId);
    return res.status(flashcard.code).json(flashcard);
  }

  async getOne(req, res) {
    const incrementView = req.query.incrementView === "true";
    const flashcard = await flashcardService.getFlashcardById(
      req.params.id,
      incrementView
    );
    return res.status(flashcard.code).json(flashcard);
  }

  async update(req, res) {
    const userId = req.user?._id || req.userId;
    const flashcard = await flashcardService.updateFlashcard(
      req.params.id,
      req.body,
      userId
    );
    return res.status(flashcard.code).json(flashcard);
  }

  async delete(req, res) {
    const flashcard = await flashcardService.deleteFlashcard(req.params.id);
    return res.status(flashcard.code).json(flashcard);
  }

  async list(req, res) {
    const flashcards = await flashcardService.listFlashcards({});
    return res.status(flashcards.code).json(flashcards);
  }

  async search(req, res) {
    const { q, limit, skip } = req.query;
    const flashcards = await flashcardService.searchFlashcards(q, {
      limit: Number(limit) || 20,
      skip: Number(skip) || 0,
    });
    return res.status(flashcards.code).json(flashcards);
  }

  // ===== NEW STATISTICS ENDPOINTS =====
  async incrementView(req, res) {
    const result = await flashcardService.incrementFlashcardView(
      req.params.id
    );
    return res.status(result.code).json(result);
  }

  async incrementStudy(req, res) {
    const result = await flashcardService.incrementFlashcardStudy(
      req.params.id
    );
    return res.status(result.code).json(result);
  }
}

module.exports = new FlashcardController();
