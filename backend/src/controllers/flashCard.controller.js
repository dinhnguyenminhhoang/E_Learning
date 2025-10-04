"use strict";

const flashcardService = require("../services/flashCard.service");

class FlashcardController {
  async create(req, res, next) {
    try {
      const flashcard = await flashcardService.createFlashcard(req.body);

      if (flashcard.status === "error") {
        return res.status(flashcard.code).json(flashcard);
      }

      res.status(201).json({ metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const flashcard = await flashcardService.getFlashcardById(req.params.id);

      if (flashcard.status === "error") {
        return res.status(flashcard.code).json(flashcard);
      }

      res.json({ metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const flashcard = await flashcardService.updateFlashcard(
        req.params.id,
        req.body
      );

      if (flashcard.status === "error") {
        return res.status(flashcard.code).json(flashcard);
      }

      res.json({ metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const flashcard = await flashcardService.deleteFlashcard(
        req.params.id,
      );

      if (flashcard.status === "error") {
        return res.status(flashcard.code).json(flashcard);
      }

      res.json({ metadata: flashcard });
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const flashcards = await flashcardService.listFlashcards({});

      if (flashcards.status === "error") {
        return res.status(flashcards.code).json(flashcards);
      }

      res.json({ metadata: flashcards });
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

      if (flashcards.status === "error") {
        return res.status(flashcards.code).json(flashcards);
      }

      res.json({ metadata: flashcards });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FlashcardController();
