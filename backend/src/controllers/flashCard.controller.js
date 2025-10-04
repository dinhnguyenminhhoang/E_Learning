"use strict";

const flashcardService = require("../services/flashCard.service");

class FlashcardController {
  async create(req, res) {
    const flashcard = await flashcardService.createFlashcard(req.body);
    return res.status(flashcard.code).json(flashcard);
  }

  async getOne(req, res) {
    const flashcard = await flashcardService.getFlashcardById(req.params.id);
    return res.status(flashcard.code).json(flashcard);
  }

  async update(req, res) {
    const flashcard = await flashcardService.updateFlashcard(
      req.params.id,
      req.body
    );
    return res.status(flashcard.code).json(flashcard);
  }

  async delete(req, res) {
    const flashcard = await flashcardService.deleteFlashcard(req.params.id);
    return res.status(flashcard.code).json(flashcard);
  }

  async list(res) {
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
}

module.exports = new FlashcardController();
