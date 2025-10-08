"use strict";

const OnboardingService = require("../services/onboarding.service");

class OnboardingController {

  async getQuestions(req, res) {
      const questions = await OnboardingService.getOnboardingQuestions();
      return res.status(questions.code).json(questions);
    }
}

module.exports = new OnboardingController();
