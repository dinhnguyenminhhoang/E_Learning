"use strict";
const { STATUS } = require("../constants/status.constans");
const { NotFoundError } = require("../core/error.response");
const FlashCard = require("../models/FlashCard");

class FlashcardRepository {
  constructor() {
    this.model = FlashCard;
    this.defaultPopulate = [
      { path: "word", select: "text pronunciation audio partOfSpeech" },
      { path: "cardDeck", select: "title description level difficulty" },
      { path: "createdBy", select: "name email avatar" },
      { path: "updatedBy", select: "name email avatar" },
    ];
  }

  async create(data) {
    try {
      const flashcard = new this.model(data);
      await flashcard.save();
      return flashcard;
    } catch (error) {
      console.error("❌ Error creating flashcard:", error);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      const { populate = true, lean = false } = options;
      let query = this.model.findById(id);

      if (populate) query = query.populate(this.defaultPopulate);
      if (lean) query = query.lean();

      return await query.exec();
    } catch (error) {
      console.error("❌ Error finding flashcard by ID:", error);
      throw error;
    }
  }

  /**
   * @param {string} word
   * @returns {Promise<Object|null>}
   */
  async getFlashCardByFrontBack(frontText) {
    try {
      return await this.model.findOne({ frontText });
    } catch (error) {
      console.error("❌ Error finding category by name:", error);
      throw error;
    }
  }

  async list() {
    try {
      const query = { status: "active" };
      const flashcards = await this.model.find(query);

      return flashcards;
    } catch (error) {
      console.error("❌ Error listing flashcards:", error);
      throw error;
    }
  }

  async findByDeck(deckId) {
    return this.model.find({
      cardDeck: deckId,
      status: STATUS.ACTIVE,
      updatedAt: null,
    });
  }

  /**
   * Lấy flashcards từ deck và populate word với đầy đủ thông tin
   * @param {String} deckId - ID của card deck
   * @returns {Promise<Array>} Array of flashcards with populated word
   */
  async findByDeckWithWord(deckId) {
    return this.model
      .find({
        cardDeck: deckId,
        status: STATUS.ACTIVE,
        updatedAt: null,
      })
      .populate({
        path: "word",
        select:
          "word pronunciation audio partOfSpeech definitions level image synonyms antonyms tags",
      })
      .lean()
      .exec();
  }

  async findByDifficulty(difficulty) {
    return this.model.find({ difficulty, status: "active", updatedAt: null });
  }

  async search(query, options = {}) {
    try {
      const { limit = 20, skip = 0 } = options;
      const searchQuery = {
        $text: { $search: query },
        status: "active",
        updatedAt: null,
      };

      return this.model
        .find(searchQuery, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      console.error("❌ Error searching flashcards:", error);
      throw error;
    }
  }

  async update(id, data, options = {}) {
    try {
      const { populate = true, returnNew = true } = options;

      let query = this.model.findOneAndUpdate(
        { _id: id },
        { $set: data },
        {
          new: returnNew,
          runValidators: true,
        }
      );

      if (populate) query = query.populate(this.defaultPopulate);

      const updated = await query.exec();
      if (!updated) throw new NotFoundError("Flashcard not found");

      return updated;
    } catch (error) {
      console.error("❌ Error updating flashcard:", error);
      throw error;
    }
  }

  async toggleActive(id) {
    try {
      const flashcard = await this.model.findById(id);
      if (!flashcard) throw new NotFoundError("Flashcard not found");

      flashcard.status = !flashcard.status;
      await flashcard.save();
      return flashcard;
    } catch (error) {
      console.error("❌ Error toggling active:", error);
      throw error;
    }
  }

  async softDelete(id) {
    try {
      const deleted = await this.model.findByIdAndUpdate(
        id,
        { updatedAt: new Date(), status: "inactive" },
        { new: true }
      );

      if (!deleted) throw new NotFoundError("Flashcard not found");

      return deleted;
    } catch (error) {
      console.error("❌ Error soft deleting flashcard:", error);
      throw error;
    }
  }

  isHard(flashcard) {
    return flashcard.difficulty === "hard";
  }

  async updateStatusFlashcards(flashcardIds, newStatus) {
    const session = await this.model.startSession();
    session.startTransaction();

    try {
      const result = await this.model.updateMany(
        { _id: { $in: flashcardIds } },
        { $set: { status: newStatus } },
        { session }
      );

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new FlashcardRepository();
