"use strict";
const UserOnboardingAnswerRepo = require("../repositories/userOnboardingAnswer.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class UserOnboardingAnswerService {
  async saveAnswers(UserId, answers) {
    await UserOnboardingAnswerRepo.deleteByUser(UserId);
    const docs = answers.map((a) => ({
      user: UserId,
      questionKey: a.questionKey,
      answerKeys: a.answerKeys,
    }));
    const userAnswer = await UserOnboardingAnswerRepo.insertMany(docs);
    return ResponseBuilder.success(
      RESPONSE_MESSAGES.SUCCESS.OK,
      userAnswer
    );
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
