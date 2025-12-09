"use strict";

const answerMapService = require("../services/answerMap.service");
const UserOnboardingAnswerService = require("../services/userOnboardingAnswer.service");

class UserOnboardingAnswerController {
  async save(req, res) {
    const userId = req.user?._id;
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const result = await UserOnboardingAnswerService.handleSaveAnswers(
      userId,
      answers
    );
    return res.status(result.code).json(result);
  }

  async get(req, res) {
    const UserId = req.user.UserId;
    const data = await UserOnboardingAnswerService.getAnswers(UserId);
    return res.status(data.code).json(result);
  }
}

module.exports = new UserOnboardingAnswerController();
