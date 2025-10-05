"use strict";

const { STATUS } = require("../constants/status.constans");
const CardDeckRepo = require("../repositories/cardDeck.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const FlashcardRepo = require("../repositories/flashcard.repo");
const CategoryRepo = require("../repositories/category.repo");

const getCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!cardDeck) {
    return ResponseBuilder.notFoundError("Card deck not found");
  }
  return ResponseBuilder.success("Fetch card deck successfully", { cardDeck });
};

const createCardDeck = async (req) => {
  const data = req.body;
  const existingCardDeck = await CardDeckRepo.getCardDeckByTitle(data.title);

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
    return ResponseBuilder.duplicateWordError(
      data.title,
      "Card deck title already exists"
    );
  }

  const newCardDeck = await CardDeckRepo.createCardDeck(data);
  return ResponseBuilder.success("Create card deck successfully", {
    cardDeck: newCardDeck,
  });
};

const updateCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const data = req.body;

  const existingCardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!existingCardDeck) {
    return ResponseBuilder.notFoundError("Card deck not found");
  }

  if (data.title && data.title !== existingCardDeck.title) {
    const existingCardDeckWithTitle = await CardDeckRepo.getCardDeckByTitle(
      data.title
    );

    if (existingCardDeckWithTitle) {
      if (existingCardDeckWithTitle.status === STATUS.DELETED) {
        await CardDeckRepo.hardDeleteCardDeck(existingCardDeckWithTitle._id);
      } else {
        return ResponseBuilder.duplicateWordError(
          data.title,
          "Card deck title already exists"
        );
      }
    }
  }

  const updatedCardDeck = await CardDeckRepo.updateCardDeck(cardDeckId, data);
  if (!updatedCardDeck) {
    return ResponseBuilder.notFoundError("Card deck not found");
  }

  return ResponseBuilder.success("Update card deck successfully", {
    cardDeck: updatedCardDeck,
  });
};

const deleteCardDeck = async (req) => {
  const { cardDeckId } = req.params;

  const existingCardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!existingCardDeck) {
    return ResponseBuilder.notFoundError("Card deck not found");
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

const getListCardDecks = async (req) => {
  const cardDecks = await CardDeckRepo.getAllCardDeck(req.query);
  console.log(cardDecks);

  return ResponseBuilder.successWithPagination(
    "Fetch card decks successfully",
    cardDecks.decks,
    {
      total: cardDecks.total,
      pageNum: cardDecks.pageNum,
      pageSize: cardDecks.pageSize,
      total: cardDecks.total,
    }
  );
};

const getCardDeckByCategory = async (req) => {
  const { categoryId } = req.params;
  const existingCategory = await CategoryRepo.findById(categoryId);

  if (!existingCategory) {
    return ResponseBuilder.notFoundError("Category not found");
  }

  const cardDecks = await CardDeckRepo.findByCategory(categoryId);
  return ResponseBuilder.success("Fetch card decks by category successfully", {
    cardDecks: cardDecks ?? [],
  });
};

module.exports = {
  getCardDeck,
  createCardDeck,
  updateCardDeck,
  deleteCardDeck,
  getListCardDecks,
  getCardDeckByCategory,
};
