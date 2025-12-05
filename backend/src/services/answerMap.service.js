"use strict";

const { SUCCESS } = require("../constants/responseMessage");
const { toObjectId } = require("../helpers/idHelper");
const answerMapRepo = require("../repositories/answerMap.repo");
const learningPathRepo = require("../repositories/learningPath.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const userLearningPathService = require("./userLearningPath.service");
const UserProgressRepository = require("../repositories/userProgress.repo");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class AnswerMapService {
  /**
   * Tạo UserProgress sau khi assign learning path thành công
   * @private
   * @param {String} userId - ID người dùng
   * @param {String|Object} learningPathId - ID learning path (có thể là ObjectId hoặc string)
   */
  async _createUserProgress(userId, learningPathId) {
    try {
      const learningPathIdObj = toObjectId(learningPathId);
      await UserProgressRepository.findOrCreate(userId, learningPathIdObj);
    } catch (error) {
      // Log error nhưng không throw để không làm fail toàn bộ flow
      console.error(
        `[AnswerMapService] Failed to create UserProgress for user ${userId}, learningPath ${learningPathId}:`,
        error.message
      );
    }
  }

  /**
   * Kiểm tra xem response có phải là error response không
   * @private
   * @param {*} response - Response từ assignPathToUser
   * @returns {Boolean}
   */
  _isErrorResponse(response) {
    return !response || (response.code && response.code !== 200);
  }

  /**
   * Lấy learningPathId từ UserLearningPath document
   * @private
   * @param {Object} userLearningPathDoc - MongoDB document từ assignPathToUser
   * @param {String} fallbackLearningPathId - Fallback learningPathId từ targetMapping
   * @returns {String|null}
   */
  _extractLearningPathId(userLearningPathDoc, fallbackLearningPathId) {
    if (!userLearningPathDoc) return null;

    // MongoDB document có thể có learningPath là ObjectId hoặc đã được populate
    const learningPath = userLearningPathDoc.learningPath;
    
    if (learningPath) {
      // Nếu là ObjectId object
      if (learningPath.toString) {
        return learningPath.toString();
      }
      // Nếu là string
      if (typeof learningPath === "string") {
        return learningPath;
      }
      // Nếu đã được populate (có _id)
      if (learningPath._id) {
        return learningPath._id.toString();
      }
    }

    // Fallback về learningPathId từ targetMapping
    return fallbackLearningPathId?.toString() || null;
  }

  async mapAnswerToTarget(userId, answers) {
    try {
      const levelAnswer = answers.find(
        (a) => a.questionKey.toUpperCase() === "LEVEL"
      );

      if (
        !levelAnswer ||
        !levelAnswer.answerKeys?.length ||
        levelAnswer.answerKeys.length === 0
      ) {
        return ResponseBuilder.notFoundError(
          "Không tìm thấy câu trả lời LEVEL."
        );
      }

      const targetMapping =
        await answerMapRepo.findMappedTargetByAnswer(levelAnswer);

      if (!targetMapping) {
        return ResponseBuilder.notFoundError(
          "Không tìm thấy mục tiêu học phù hợp."
        );
      }

      const assignToUser = await userLearningPathService.assignPathToUser(
        toObjectId(userId),
        targetMapping.learningPath,
        targetMapping.target
      );

      // Kiểm tra nếu là error response (duplicate hoặc lỗi khác)
      if (this._isErrorResponse(assignToUser)) {
        return assignToUser || ResponseBuilder.badRequest("Gán lộ trình học thất bại.");
      }

      // Assign thành công, tạo UserProgress
      const learningPathId = this._extractLearningPathId(
        assignToUser,
        targetMapping.learningPath
      );

      if (learningPathId) {
        await this._createUserProgress(toObjectId(userId), learningPathId);
      }

      return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED);
    } catch (err) {
      console.error(
        `[AnswerMapService] Error mapping answer for user ${userId}:`,
        err
      );
      return ResponseBuilder.error(
        RESPONSE_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        err.message
      );
    }
  }
}

module.exports = new AnswerMapService();
