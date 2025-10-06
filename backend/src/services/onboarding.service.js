"use strict";

const OnboardingRepo = require("../repositories/onboarding.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class OnboardingService {
async getOnboardingQuestions() {
    const questions = await OnboardingRepo.getActiveQuestions();

    const q = questions.map((q) => ({
        key: q.key,
        title: q.title,
        description: q.description,
        type: q.type,
        options: q.options.map((opt) => ({
            key: opt.key,
            label: opt.label,
            icon: opt.icon,
            description: opt.description,
        })),
    }));

    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, q);
  }
}

module.exports = new OnboardingService();
