"use strict";

const RESPONSE_MESSAGES = require("../constants/responseMessage");
const flashcardRepository = require("../repositories/flashcard.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { STATUS } = require("../constants/status.constans");
const HTTP_STATUS = require("../constants/httpStatus");

class FlashcardService {
  async createFlashcard(data) {
    const existingFlashcard = await flashcardRepository.getFlashCardByFrontBack(
      data.frontText
    );
    if (existingFlashcard) {
      if (existingFlashcard.status === STATUS.DELETED) {
        data.status = STATUS.ACTIVE;
        const restored = await flashcardRepository.update(
          existingFlashcard._id,
          data
        );
        return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED, {
          flashcard: restored,
        });
      }
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.CONFLICT,
        HTTP_STATUS.CONFLICT
      );
    }
    const newFlashCard = await flashcardRepository.create(data);
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED, {
      flashcard: newFlashCard,
    });
  }

  async getFlashcardById(id) {
    const flashcard = await flashcardRepository.findById(id);
    if (!flashcard || flashcard.length === 0) {
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, {
      flashcard: flashcard,
    });
  }

  async updateFlashcard(id, data) {
    const flashcard = await flashcardRepository.update(id, data);
    if (!flashcard || flashcard.length === 0) {
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.UPDATED, {
      flashcard,
    });
  }

  async deleteFlashcard(id) {
    const flashcard = await flashcardRepository.softDelete(id);
    if (!flashcard || flashcard.length === 0) {
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.DELETED);
  }

  async listFlashcards({ limit = 20, skip = 0, deckId }) {
    const flashcards = await flashcardRepository.list();
    if (!flashcards || flashcards.length === 0) {
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, {
      flashcards,
    });
  }

  async searchFlashcards(q, { limit = 20, skip = 0 }) {
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return ResponseBuilder.badRequestError(
        "Query parameter 'q' is required and must be non-empty string"
      );
    }
    q = q.trim();
    if (limit <= 0 || skip < 0) {
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }
    const flashcards = await flashcardRepository.search(q, { limit, skip });
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, {
      flashcards,
    });
  }
}

module.exports = new FlashcardService();
