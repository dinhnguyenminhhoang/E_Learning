"use strict";

const flashcardService = require("../services/flashCard.service");

class FlashcardController {
  async create(req, res, next) {
    try {
      const flashcard = await flashcardService.createFlashcard(req.body);
      res.status(201).json({ message: "Flashcard created", metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const flashcard = await flashcardService.getFlashcardById(req.params.id);
      res.json({ message: "Flashcard fetched", metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const flashcard = await flashcardService.updateFlashcard(req.params.id, req.body);
      res.json({ message: "Flashcard updated", metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const flashcard = await flashcardService.deleteFlashcard(req.params.id, req.user._id);
      res.json({ message: "Flashcard deleted", metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const { limit, skip, deckId } = req.query;
      const flashcards = await flashcardService.listFlashcards({
        limit: Number(limit) || 20,
        skip: Number(skip) || 0,
        deckId,
      });
      res.json({ message: "Flashcards list", metadata: flashcards });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q, limit, skip } = req.query;
      const flashcards = await flashcardService.searchFlashcards(q, {
        limit: Number(limit) || 20,
        skip: Number(skip) || 0,
      });
      res.json({ message: "Search successful", metadata: flashcards });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FlashcardController();
