"use strict";

const answerMapService = require("../services/answerMap.service");
const UserOnboardingAnswerService = require("../services/userOnboardingAnswer.service");

class UserOnboardingAnswerController {
  async save(req, res) {
    const UserId = req.user?.UserId ||
        req.user?.userId ||
        req.user?._id ||
        req.body?.userId ||
        req.query?.userId;;
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const result = await UserOnboardingAnswerService.saveAnswers(
      UserId,
      answers
    );
    const targets = await answerMapService.mapAnswerToTarget(answers);
    return res.status(targets.code).json(targets);
  }

  async get(req, res) {
    const UserId = req.user.UserId;
    const data = await UserOnboardingAnswerService.getAnswers(UserId);
    return res.status(data.code).json(result);
  }
}

module.exports = new UserOnboardingAnswerController();
