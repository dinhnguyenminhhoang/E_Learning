"use strict";
import { STATUS } from "../constants/status.constans.js";
import * as CardDeckRepo from "../repositories/cardDeck.repo.js";
import ResponseBuilder from "../types/response/baseResponse.js";
import * as FlashcardRepo from "../repositories/flashcard.repo.js";
export const getCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!cardDeck) {
    return ResponseBuilder.notFoundError();
  }
  return ResponseBuilder.success("Fetch card deck successfully", {
    cardDeck,
  });
};

export const createCardDeck = async (req) => {
  const { data } = req.body;
  const existingCardDeck = await CardDeckRepo.getCardDeckByName(data.name);
  if (existingCardDeck) {
    if (existingCardDeck.status === STATUS.DELETED) {
      data.status = STATUS.ACTIVE;
      const restored = await CardDeckRepo.updateCardDeck(
        existingCardDeck._id,
        data
      );
      return ResponseBuilder.success("Create card deck successfully", {
        cardDeck: restored,
      });
    }
    return ResponseBuilder.duplicateError();
  }
  const newCardDeck = await CardDeckRepo.createCardDeck(data);
  return ResponseBuilder.success("Create card deck successfully", {
    cardDeck: newCardDeck,
  });
};

export const updateCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const { data } = req.body;
  const existingCardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!existingCardDeck) {
    return ResponseBuilder.notFoundError();
  }
  if (data.name && data.name !== existingCardDeck.name) {
    const existingCardDeckWithName = await CardDeckRepo.getCardDeckByName(
      data.name
    );

    if (existingCardDeckWithName) {
      if (existingCardDeckWithName.status === STATUS.DELETED) {
        await CardDeckRepo.hardDeleteCardDeck(existingCardDeckWithName._id);
      }
    }
  }

  const updatedCardDeck = await CardDeckRepo.updateCardDeck(cardDeckId, data);
  if (!updatedCardDeck) {
    return ResponseBuilder.notFoundError();
  }
  return ResponseBuilder.success("Update card deck successfully", {
    cardDeck: updatedCardDeck,
  });
};

export const deleteCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const existingCardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!existingCardDeck) {
    return ResponseBuilder.notFoundError();
  }

  const flashcards = await FlashcardRepo.findByDeck(cardDeckId);
  const flashcardIds = flashcards.map((fc) => fc._id);

  FlashcardRepo.updateStatusFlashcards(flashcardIds, STATUS.INACTIVE).catch(
    (error) => {
      console.error("❌ Error updating flashcards status:", error);
    }
  );
  await CardDeckRepo.deleteCardDeck(cardDeckId);
  return ResponseBuilder.success("Delete card deck successfully");
};

export const getListCardDecks = async (req) => {
  const cardDecks = await FlashcardRepo.getAllCardDeck(req.query);
};
