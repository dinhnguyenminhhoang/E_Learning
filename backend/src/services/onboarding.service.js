"use strict";

const OnboardingRepo = require("../repositories/onboarding.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class OnboardingService {
async getOnboardingQuestions() {
    const questions = await OnboardingRepo.getActiveQuestions();

    if(!questions || questions.length === 0){
        return ResponseBuilder.notFoundError();
    }

    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, questions);
  }
}

module.exports = new OnboardingService();
