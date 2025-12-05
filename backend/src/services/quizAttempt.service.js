"use strict";

const QuizAttemptRepository = require("../repositories/quizAttempt.repo");

class QuizAttemptService {
  /**
   * Tạo nhiều quiz attempt cùng lúc (bulk insert).
   * Service này chỉ tập trung vào nghiệp vụ, không phụ thuộc HTTP layer.
   *
   * @param {Array<object>} attempts - Danh sách payload QuizAttempt đã được chuẩn hóa
   *   ví dụ: { user, quiz, answers, score, percentage, timeSpent, status, startedAt, completedAt }
   * @returns {Promise<Array<object>>} Danh sách QuizAttempt đã được tạo
   */
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
     