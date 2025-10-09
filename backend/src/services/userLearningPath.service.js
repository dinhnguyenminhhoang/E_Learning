"use strict";

const ResponseBuilder = require("../types/response/baseResponse"); // nếu bạn đang dùng format này
const UserLearningPathRepository = require("../repositories/userLearningPath.repo"); // ✅ import repo

class UserLearningPathService {
  /**
   * Gán lộ trình học (learningPath) cho user, kèm target
   * @param {String} userId - ID người dùng
   * @param {String} learningPathId - ID lộ trình
   * @param {String} targetId - ID mục tiêu học tập (optional)
   */
  async assignPathToUser(userId, learningPathId, targetId) {
    // Kiểm tra xem user đã có lộ trình này chưa
    const existing = await UserLearningPathRepository.findByUserAndPath(
      userId,
      learningPathId
    );

    
    if (existing) {
      return null;
    }
    console.log("ok");

    // Tạo bản ghi mới
    const newRecord = await UserLearningPathRepository.create({
      user: userId,
      learningPath: learningPathId,
      target: targetId || null,
      status: "active",
      progress: {
        currentLevel: 1,
        currentLesson: 1,
        completedLessons: [],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      },
      lastAccAt: Date.now(),
    });

    return newRecord;
  }

  // Lấy tất cả lộ trình mà user đã tham gia
  async getUserLearningPaths(userId) {
    const paths = await UserLearningPathRepository.findByUserId(userId);
    return ResponseBuilder.success("Fetched user learning paths", paths);
  }
}

module.exports = new UserLearningPathService();
