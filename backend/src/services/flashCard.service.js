"use strict";

const flashcardRepository = require("../repositories/flashcard.repo");

class FlashcardService {
  async createFlashcard(data) {
    return await flashcardRepository.create(data);
  }

  async getFlashcardById(id) {
    const flashcard = await flashcardRepository.findById(id);
    if (!flashcard) {
      const err = new Error("Flashcard not found");
      err.status = 404;
      throw err;
    }
    return flashcard;
  }

  async updateFlashcard(id, data) {
    const flashcard = await flashcardRepository.update(id, data);
    if (!flashcard) {
      const err = new Error("Flashcard not found");
      err.status = 404;
      throw err;
    }
    return flashcard;
  }

  async deleteFlashcard(id, userId) {
    const flashcard = await flashcardRepository.softDelete(id, userId);
    if (!flashcard) {
      const err = new Error("Flashcard not found");
      err.status = 404;
      throw err;
    }
    return flashcard;
  }

  async listFlashcards({ limit = 20, skip = 0, deckId }) {
    return await flashcardRepository.list({ limit, skip, deckId });
  }

  async searchFlashcards(q, { limit = 20, skip = 0 }) {
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      const err = new Error("Query parameter 'q' is required and must be non-empty string");
      err.status = 400;
      throw err;
    }
    return await flashcardRepository.search(q, { limit, skip });
  }
}

module.exports = new FlashcardService();
