"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");

class UserLearningPathService {
  /**
   * Gán lộ trình học (learningPath) cho user, kèm target
   * @param {String} userId - ID người dùng
   * @param {String} learningPathId - ID lộ trình
   * @param {String} targetId - ID mục tiêu học tập (optional)
   */
  async assignPathToUser(userId, learningPathId, targetId) {
    const existing = await UserLearningPathRepository.findByUserAndPath(
      userId,
      learningPathId
    );

    if (existing) {
      return ResponseBuilder.duplicateError();
    }

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

  async getUserLearningPaths(req) {
    const userId = req.user._id;
    const paths = await UserLearningPathRepository.findByUserId(userId);
    return ResponseBuilder.success("Fetched user learning paths", paths);
  }
}

module.exports = new UserLearningPathService();
