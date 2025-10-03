"use strict";

const flashcardRepository = require("../repositories/flashcard.repo");

class FlashcardService {
  async createFlashcard(data) {
    const flashcard = await flashcardRepository.create(data);
    return ResponseBuilder.success("Flashcard created successfully", {
      flashcard,
    });
  }

  async getFlashcardById(id) {
    const flashcard = await flashcardRepository.findById(id);
    if (!flashcard) {
      return ResponseBuilder.notFoundError("Flashcard not found");
    }
    return ResponseBuilder.success("Fetch flashcard successfully", {
      flashcard,
    });
  }

  async updateFlashcard(id, data) {
    const flashcard = await flashcardRepository.update(id, data);
    if (!flashcard) {
      return ResponseBuilder.notFoundError("Flashcard not found");
    }
    return ResponseBuilder.success("Flashcard updated successfully", {
      flashcard,
    });
  }

  async deleteFlashcard(id, userId) {
    const flashcard = await flashcardRepository.softDelete(id, userId);
    if (!flashcard) { 
      return ResponseBuilder.notFoundError("Flashcard not found");
    }
    return ResponseBuilder.success("Flashcard deleted successfully");
  }

  async listFlashcards({ limit = 20, skip = 0, deckId }) {
    return await flashcardRepository.list({});
  }

  async searchFlashcards(q, { limit = 20, skip = 0 }) {
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return ResponseBuilder.badRequestError(
        "Query parameter 'q' is required and must be non-empty string"
      );
    }
    q = q.trim();
    if (limit <= 0 || skip < 0) {
      return ResponseBuilder.badRequestError("Invalid pagination parameters");
    }
    const flashcards = await flashcardRepository.search(q, { limit, skip });
    return ResponseBuilder.success("Fetch flashcards successfully", {
      flashcards,
    });
  }
}

module.exports = new FlashcardService();
