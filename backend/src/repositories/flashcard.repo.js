"use strict";

const Flashcard = require("../models/Flashcard");
const { NotFoundError } = require("../core/error.response");

class FlashcardRepository {
  constructor() {
    this.model = Flashcard;
    this.defaultPopulate = [
      { path: "word", select: "text" },
      { path: "cardDeck", select: "name" },
      { path: "deletedBy", select: "name email" },
    ];
  }

  // ===== CREATE =====
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

  // ===== READ =====
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

  async list({ limit = 20, skip = 0, deckId = null, difficulty = null }) {
    try {
      const query = { status: "active", deletedAt: null };
      if (deckId) query.cardDeck = deckId;
      if (difficulty) query.difficulty = difficulty;

      return this.model.find(query).skip(skip).limit(limit);
    } catch (error) {
      console.error("❌ Error listing flashcards:", error);
      throw error;
    }
  }

  async findByDeck(deckId) {
    return this.model.find({ cardDeck: deckId, status: "active", deletedAt: null });
  }

  async findByDifficulty(difficulty) {
    return this.model.find({ difficulty, status: "active", deletedAt: null });
  }

  async search(query, options = {}) {
    try {
      const { limit = 20, skip = 0 } = options;
      const searchQuery = { $text: { $search: query }, status: "active", deletedAt: null };

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

  // ===== UPDATE =====
  async update(id, data, options = {}) {
    try {
      const { populate = true, returnNew = true } = options;

      let query = this.model.findByIdAndUpdate(id, data, { new: returnNew, runValidators: true });

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

      flashcard.isActive = !flashcard.isActive;
      await flashcard.save();
      return flashcard;
    } catch (error) {
      console.error("❌ Error toggling active:", error);
      throw error;
    }
  }

  // ===== DELETE =====
  async softDelete(id, userId) {
    try {
      const deleted = await this.model.findByIdAndUpdate(
        id,
        { deletedAt: new Date(), deletedBy: userId, status: "inactive" },
        { new: true }
      );

      if (!deleted) throw new NotFoundError("Flashcard not found");

      return deleted;
    } catch (error) {
      console.error("❌ Error soft deleting flashcard:", error);
      throw error;
    }
  }

  // ===== CUSTOM LOGIC =====
  isHard(flashcard) {
    return flashcard.difficulty === "hard";
  }
}

module.exports = new FlashcardRepository();
