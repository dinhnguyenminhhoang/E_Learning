"use strict";
const UserOnboardingAnswerRepo = require("../repositories/userOnboardingAnswer.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");
const AnswerMapService = require("../services/answerMap.service");
const userLearningPathRepo = require("../repositories/userLearningPath.repo");

class UserOnboardingAnswerService {
  async handleSaveAnswers(userId, answers) {
    if (!userId) return ResponseBuilder.badRequest("Vui lòng đăng nhập.");

    if (!Array.isArray(answers) || answers.length === 0)
      return ResponseBuilder.badRequest("Không có dữ liệu câu trả lời.");

    const existingAnswers = await UserOnboardingAnswerRepo.getByUser(userId);
    if (existingAnswers && existingAnswers.length > 0)
      return ResponseBuilder.duplicateError();

    const docs = answers.map((a) => ({
      user: userId,
      questionKey: a.questionKey?.toUpperCase(),
      answerKeys: a.answerKeys?.map((key) => key.toUpperCase()),
    }));

    const savedAnswers = await UserOnboardingAnswerRepo.insertMany(docs);

    if (!savedAnswers) return ResponseBuilder.badRequest();

    const mapResult = await AnswerMapService.mapAnswerToTarget(userId, answers);
    const learningPath = await userLearningPathRepo.findByUserId(
      toObjectId(userId)
    );

    return { learningPathId: learningPath[0]._id ?? "", ...mapResult };
  }

  async getAnswers(UserId) {
    const getAnswers = UserOnboardingAnswerRepo.getByUser(UserId);
    if (!getAnswers || getAnswers.length === 0)
      return ResponseBuilder.notFoundError();
    return ResponseBuilder.success(
      RESPONSE_MESSAGES.SUCCESS.FETCHED,
      getAnswers
    );
  }
}

module.exports = new UserOnboardingAnswerService();
