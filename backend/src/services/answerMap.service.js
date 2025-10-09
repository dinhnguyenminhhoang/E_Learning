"use strict";

const { SUCCESS } = require("../constants/responseMessage");
const { toObjectId } = require("../helpers/idHelper");
const answerMapRepo = require("../repositories/answerMap.repo");
const learningPathRepo = require("../repositories/learningPath.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const userLearningPathService = require("./userLearningPath.service");

class AnswerMapService {
  async mapAnswerToTarget(userId, answers) {
    if (!answers || answers.length === 0) {
      return ResponseBuilder.notFoundError("No answers provided");
    }

    const levelAnswer = answers.find(
      (a) => a.questionKey.toUpperCase() === "LEVEL"
    );

    if (!levelAnswer || !levelAnswer.answerKeys?.length) {
      return ResponseBuilder.notFoundError("No LEVEL answer found");
    }

    const targetMapping =
      await answerMapRepo.findMappedTargetByAnswer(levelAnswer);
    if (!targetMapping) {
      return ResponseBuilder.notFoundError("No target found for given answers");
    }

    const { target, learningPath } = targetMapping;
    if (!target || !learningPath) {
      return ResponseBuilder.notFoundError(
        "Mapping missing target or learningPath"
      );
    }

    try {
      const assignToUser = await userLearningPathService.assignPathToUser(
        toObjectId(userId),
        learningPath._id,
        target._id
      );
      if (!assignToUser) {
        return ResponseBuilder.badRequest();
      }
    } catch (err) {
      console.error(
        `[mapAnswerToTarget] Failed to assign path for user ${userId}`,
        err.message
      );
    }

    return ResponseBuilder.success(SUCCESS.CREATED, { target, learningPath });
  }
}

module.exports = new AnswerMapService();
