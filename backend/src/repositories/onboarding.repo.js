"use strict"

const OnboardingQuestion = require("../models/OnboardingQuestion")

class OnboardingRepo {
    async getActiveQuestions() {
        return await OnboardingQuestion.find({ isActive: true })
            .sort({ order: 1 })
            .select("key title description type options order ");
    }

    async getQuestionByKey(key) {
        return await OnboardingQuestion.findOne({ key, isActive: true });
    }
}

module.exports = new OnboardingRepo();