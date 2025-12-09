"use strict";

const { STATUS } = require("../constants/status.constans");
const AnswerMap = require("../models/AnswerMap");

class AnswerMapRepo {
  async findByQuestionKey(answers, targetQuestionKey) {
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return null;
    }

    const answer = answers.find(
      (a) =>
        a.questionKey &&
        a.questionKey.toUpperCase() === targetQuestionKey.toUpperCase()
    );

    if (!answer) {
      return null;
    }

    return this.findMappedTargetByAnswer(answer);
  }

  async findMappedTargetByAnswer(answer) {
    if (!answer || !answer.answerKeys || answer.answerKeys.length === 0)
      return null;

    let rawValue;

    if (answer.questionKey.toUpperCase() === "LEVEL") {
      rawValue = answer.answerKeys[0]?.toUpperCase();
    } else {
      rawValue = answer.answerKeys.map((v) => v.toUpperCase());
    }

    const query = {
      questionKey: { $regex: new RegExp(`^${answer.questionKey}$`, "i") },
      status: STATUS.ACTIVE,
    };
    if (Array.isArray(rawValue)) {
      query.rawValue = { $in: rawValue };
    } else {
      query.rawValue = rawValue;
    }

    const mapping = await AnswerMap.findOne(query).select(
      "_id learningPath target"
    );
    return mapping;
  }
}

module.exports = new AnswerMapRepo();
