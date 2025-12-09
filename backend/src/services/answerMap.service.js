"use strict";

const { SUCCESS } = require("../constants/responseMessage");
const { toObjectId } = require("../helpers/idHelper");
const answerMapRepo = require("../repositories/answerMap.repo");
const learningPathRepo = require("../repositories/learningPath.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const userLearningPathService = require("./userLearningPath.service");
const UserProgressRepository = require("../repositories/userProgress.repo");
const RESPONSE_MESSAGES = require("../constants/responseMessage");
const DEFAULT_LEARNING_PATH_KEY = "path-beginner";

class AnswerMapService {
  async _createUserProgress(userId, learningPathId) {
    try {
      const learningPathIdObj = toObjectId(learningPathId);
      await UserProgressRepository.findOrCreate(userId, learningPathIdObj);
    } catch (error) {
      console.error(
        `[AnswerMapService] Failed to create UserProgress for user ${userId}, learningPath ${learningPathId}:`,
        error.message
      );
    }
  }

  _isErrorResponse(response) {
    return !response || (response.code && response.code !== 200);
  }
  
  _extractLearningPathId(userLearningPathDoc, fallbackLearningPathId) {
    if (!userLearningPathDoc) return null;

    const learningPath = userLearningPathDoc.learningPath;

    if (learningPath) {
      if (learningPath.toString) {
        return learningPath.toString();
      }
      if (typeof learningPath === "string") {
        return learningPath;
      }
      if (learningPath._id) {
        return learningPath._id.toString();
      }
    }

    return fallbackLearningPathId?.toString() || null;
  }

  async mapAnswerToTarget(userId, answers) {
    try {
      const goalsAnswer = answers.find(
        (a) => a.questionKey?.toUpperCase() === "GOALS"
      );
      const levelAnswer = answers.find(
        (a) => a.questionKey?.toUpperCase() === "LEVEL"
      );

      if (!goalsAnswer && !levelAnswer) {
        return ResponseBuilder.badRequest(
          "Cần ít nhất một trong hai: GOALS hoặc LEVEL"
        );
      }

      let learningPathKey = null;
      
      if (goalsAnswer?.answerKeys?.[0] && levelAnswer?.answerKeys?.[0]) {
        const goalsValue = goalsAnswer.answerKeys[0]
          .toLowerCase()
          .replace(/_/g, "-");
        const levelValue = levelAnswer.answerKeys[0].toLowerCase();

        learningPathKey = `path-${goalsValue}-${levelValue}`;

        const learningPath = await learningPathRepo.findByKey(learningPathKey);

        if (learningPath) {
          const assignToUser = await userLearningPathService.assignPathToUser(
            toObjectId(userId),
            learningPath._id,
            learningPath.target?._id || null
          );

          if (this._isErrorResponse(assignToUser)) {
            return (
              assignToUser ||
              ResponseBuilder.badRequest("Gán lộ trình học thất bại.")
            );
          }

          const learningPathId = this._extractLearningPathId(
            assignToUser,
            learningPath._id
          );

          if (learningPathId) {
            await this._createUserProgress(toObjectId(userId), learningPathId);
          }

          return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED);
        }
      }
      
      if (goalsAnswer?.answerKeys?.[0]) {
        const goalsMapping = await answerMapRepo.findByQuestionKey(
          answers,
          "GOALS"
        );

        if (goalsMapping?.learningPath) {
          const assignToUser = await userLearningPathService.assignPathToUser(
            toObjectId(userId),
            goalsMapping.learningPath,
            goalsMapping.target
          );

          if (this._isErrorResponse(assignToUser)) {
            return (
              assignToUser ||
              ResponseBuilder.badRequest("Gán lộ trình học thất bại.")
            );
          }

          const learningPathId = this._extractLearningPathId(
            assignToUser,
            goalsMapping.learningPath
          );

          if (learningPathId) {
            await this._createUserProgress(toObjectId(userId), learningPathId);
          }

          return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED);
        }
      }

      if (levelAnswer?.answerKeys?.[0]) {
        const levelMapping = await answerMapRepo.findByQuestionKey(
          answers,
          "LEVEL"
        );

        const learningPathToAssign = DEFAULT_LEARNING_PATH_KEY;

        const assignToUser = await userLearningPathService.assignPathToUser(
          toObjectId(userId),
          learningPathToAssign,
          levelMapping?.target || null
        );

        if (this._isErrorResponse(assignToUser)) {
          return (
            assignToUser ||
            ResponseBuilder.badRequest("Gán lộ trình học thất bại.")
          );
        }

        const learningPathId = this._extractLearningPathId(
          assignToUser,
          learningPathToAssign
        );

        if (learningPathId) {
          await this._createUserProgress(toObjectId(userId), learningPathId);
        }

        return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.CREATED);
      }

      return ResponseBuilder.notFoundError(
        "Không tìm thấy lộ trình học phù hợp."
      );
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
