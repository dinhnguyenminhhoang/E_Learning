"use strict";

const QuizAttemptRepository = require("../repositories/quizAttempt.repo");

class QuizAttemptService {
  async createQuizAttemptRange(attempts = []) {
    if (!Array.isArray(attempts) || attempts.length === 0) {
      return [];
    }

    const createdAttempts =
      await QuizAttemptRepository.createQuizAttemptRange(attempts);

    return createdAttempts;
  }
}

module.exports = new QuizAttemptService();
