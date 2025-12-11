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
    return QuizAttempt.findById(id)
      .populate({
        path: "quiz",
        select: "skill questions title", // Chỉ lấy các fields cần thiết
      })
      .lean();
  }

  /**
   * Find by ID without lean (returns Mongoose document for saving)
   */
  async findByIdForUpdate(id) {
    return QuizAttempt.findById(id).populate({
      path: "quiz",
      select: "skill questions title",
    });
  }

  /**
   * Update quiz attempt by ID
   */
  async updateById(id, updateData) {
    return QuizAttempt.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }
}

module.exports = new QuizAttemptRepository();
