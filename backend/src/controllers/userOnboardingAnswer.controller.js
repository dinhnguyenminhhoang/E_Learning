"use strict";

const UserOnboardingAnswerService = require("../services/userOnboardingAnswer.service");

class UserOnboardingAnswerController {
  async save(req, res) {
    const UserId = res.user.UserId;
    const { answer } = req.body;
    const result = await UserOnboardingAnswerService.saveAnswers(
      UserId,
      answer
    );
    return res.status(result.code).json(result);
  }

  async get(res, req) {
    const UserId = res.user.UserId;
    const data = await UserOnboardingAnswerService.getAnswers(UserId);
    return res.status(data.code).json(result);
  }
}

module.exports = new UserOnboardingAnswerController();
