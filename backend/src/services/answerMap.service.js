"use strict";

const { SUCCESS } = require("../constants/responseMessage");
const { toObjectId } = require("../helpers/idHelper");
const answerMapRepo = require("../repositories/answerMap.repo");
const learningPathRepo = require("../repositories/learningPath.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const userLearningPathService = require("./userLearningPath.service");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class AnswerMapService {
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

      if (!assignToUser) {
        return ResponseBuilder.badRequest("Gán lộ trình học thất bại.");
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
