"use strict";

const { STATUS } = require("../constants/status.constans");
const CardDeckRepo = require("../repositories/cardDeck.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const FlashcardRepo = require("../repositories/flashcard.repo");
const CategoryRepo = require("../repositories/category.repo");

const getCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const incrementView = req.query.incrementView === "true";

  const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!cardDeck) {
    return ResponseBuilder.notFoundError();
  }

  // Optionally increment view count
  if (incrementView && cardDeck.incrementView) {
    await cardDeck.incrementView().catch((err) => {
      console.warn("Failed to increment view count:", err);
    });
  }

  return ResponseBuilder.success("Fetch card deck successfully", { cardDeck });
};

const createCardDeck = async (req) => {
  const data = req.body;
  const userId = req.user?._id || req.userId; // Get from authenticated user

  // Auto-set createdBy if user authenticated
  if (userId) {
    data.createdBy = userId;
  }

  const existingCardDeck = await CardDeckRepo.getCardDeckByTitle(data.title);

  if (existingCardDeck) {
    if (existingCardDeck.status === STATUS.DELETED) {
      data.status = STATUS.ACTIVE;
      if (userId) {
        data.updatedBy = userId;
      }
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

const updateCardDeck = async (req) => {
  const { cardDeckId } = req.params;
  const data = req.body;
  const userId = req.user?._id || req.userId;

  // Auto-set updatedBy if user authenticated
  if (userId) {
    data.updatedBy = userId;
    data.updatedAt = new Date();
  }

  const existingCardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!existingCardDeck) {
    return ResponseBuilder.notFoundError();
  }

  if (data.title && data.title !== existingCardDeck.title) {
    const existingCardDeckWithTitle = await CardDeckRepo.getCardDeckByTitle(
      data.title
    );

    if (existingCardDeckWithTitle) {
      if (existingCardDeckWithTitle.status === STATUS.DELETED) {
        await CardDeckRepo.hardDeleteCardDeck(existingCardDeckWithTitle._id);
      } else {
        return ResponseBuilder.duplicateError();
      }
    }
  }

  const updatedCardDeck = await CardDeckRepo.updateCardDeck(cardDeckId, data);
  if (!updatedCardDeck) {
    return ResponseBuilder.notFoundError();
  }

  // Update card count if needed
  if (updatedCardDeck.updateCardCount) {
    await updatedCardDeck.updateCardCount().catch((err) => {
      console.warn("Failed to update card count:", err);
    });
  }

  return ResponseBuilder.success("Update card deck successfully", {
    cardDeck: updatedCardDeck,
  });
};

const deleteCardDeck = async (req) => {
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

// ===== NEW METHODS FOR STATISTICS =====
const incrementCardDeckView = async (req) => {
  const { cardDeckId } = req.params;
  const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!cardDeck) {
    return ResponseBuilder.notFoundError();
  }
  await cardDeck.incrementView();
  return ResponseBuilder.success("View count incremented");
};

const incrementCardDeckStudy = async (req) => {
  const { cardDeckId } = req.params;
  const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!cardDeck) {
    return ResponseBuilder.notFoundError();
  }
  await cardDeck.incrementStudy();
  return ResponseBuilder.success("Study count incremented");
};

const updateCardDeckCardCount = async (req) => {
  const { cardDeckId } = req.params;
  const cardDeck = await CardDeckRepo.getCardDeckById(cardDeckId);
  if (!cardDeck) {
    return ResponseBuilder.notFoundError();
  }
  await cardDeck.updateCardCount();
  return ResponseBuilder.success("Card count updated", {
    cardCount: cardDeck.cardCount,
  });
};

module.exports = {
  getCardDeck,
  createCardDeck,
  updateCardDeck,
  deleteCardDeck,
  getListCardDecks,
  getCardDeckByCategory,
  incrementCardDeckView,
  incrementCardDeckStudy,
  updateCardDeckCardCount,
};
