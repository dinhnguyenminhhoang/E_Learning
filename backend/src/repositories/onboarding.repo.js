"use strict"

const OnboardingQuestion = require("../models/OnboardingQuestion");
const { STATUS } = require("../constants/status.constans");

class OnboardingRepo {
    async getActiveQuestions() {
        return await OnboardingQuestion.find({ status: STATUS.ACTIVE })
            .sort({ order: 1 })
            .select("key title description type options order ");
    }

    async getQuestionByKey(key) {
        return await OnboardingQuestion.findOne({ key, status: STATUS.ACTIVE });
    }
}

module.exports = new OnboardingRepo();