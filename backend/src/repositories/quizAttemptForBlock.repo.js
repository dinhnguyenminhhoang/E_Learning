"use strict";

const QuizAttemptForBlock = require("../models/QuizAttemptForBlock");

class QuizAttemptForBlockRepository {
  async create(data) {
    return await QuizAttemptForBlock.create(data);
  }

  async findById(id) {
    return await QuizAttemptForBlock.findById(id).populate("quiz");
  }

  async findByUserAndBlock(userId, blockId) {
    return await QuizAttemptForBlock.findByUserAndBlock(userId, blockId);
  }

  async findLatestAttempt(userId, blockId) {
    return await QuizAttemptForBlock.findLatestAttempt(userId, blockId);
  }

  async findPassedAttempt(userId, blockId) {
    return await QuizAttemptForBlock.findPassedAttempt(userId, blockId);
  }

  async update(id, updates) {
    return await QuizAttemptForBlock.findByIdAndUpdate(id, updates, {
      new: true,
    });
  }

  async findOne(filter) {
    return await QuizAttemptForBlock.findOne(filter);
  }

  async findAll(filter) {
    return await QuizAttemptForBlock.find(filter).sort({ createdAt: -1 });
  }

  async countAttempts(userId, blockId) {
    return await QuizAttemptForBlock.countDocuments({
      user: userId,
      block: blockId,
      updatedAt: null,
    });
  }

  async deleteSoft(id) {
    return await QuizAttemptForBlock.findByIdAndUpdate(
      id,
      { updatedAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new QuizAttemptForBlockRepository();
