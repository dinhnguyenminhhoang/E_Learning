"use strict";

const QuizAttempt = require("../models/QuizAttempt");

class QuizAttemptRepository {
  /**
   * Tạo nhiều QuizAttempt cùng lúc.
   * @param {Array<object>} attempts - Danh sách payload QuizAttempt đã được chuẩn hóa.
   * @returns {Promise<Array<object>>} Danh sách QuizAttempt đã được tạo.
   */
  async createQuizAttemptRange(attempts = []) {
    if (!Array.isArray(attempts) || attempts.length === 0) {
      return [];
    }

    return await QuizAttempt.insertMany(attempts, {
      ordered: false, // không dừng lại nếu 1 phần tử lỗi
    });
  }

  async findById(id) {
    return QuizAttempt.findById(id);
  }
}

module.exports = new QuizAttemptRepository();