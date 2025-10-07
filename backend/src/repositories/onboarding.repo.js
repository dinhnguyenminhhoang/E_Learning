"use strict"

const OnboardingQuestion = require("../models/OnboardingQuestion")

class OnboardingRepo {
    async getActiveQuestions() {
        return await OnboardingQuestion.find({ status: true })
            .sort({ order: 1 })
            .select("key title description type options order ");
    }

    async getQuestionByKey(key) {
        return await OnboardingQuestion.findOne({ key, status: true });
    }
}

module.exports = new OnboardingRepo();