"use strict";

const answerMapService = require("../services/answerMap.service");
const UserOnboardingAnswerService = require("../services/userOnboardingAnswer.service");

class UserOnboardingAnswerController {
  async save(req, res) {
    const UserId = req.user?._id;
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    await UserOnboardingAnswerService.saveAnswers(UserId, answers);
    const targets = await answerMapService.mapAnswerToTarget(UserId, answers);
    return res.status(targets.code).json(targets);
  }

  async get(req, res) {
    const UserId = req.user.UserId;
    const data = await UserOnboardingAnswerService.getAnswers(UserId);
    return res.status(data.code).json(result);
  }
}

module.exports = new UserOnboardingAnswerController();
