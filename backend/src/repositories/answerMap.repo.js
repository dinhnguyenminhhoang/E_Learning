"use strict";

const AnswerMap = require("../models/AnswerMap");
const answerMapRepo = require("../models/AnswerMap");

class AnswerMapRepo {
  async findMappedTargetsByAnswers(answers) {
    const mappings = await AnswerMap.find({
      questionKey: { $in: answers.map((a) => a.questionKey) },
      rawValue: { $in: answers.flatmap((a) => a.answers) },
    }).populate("target");
    return mappings.map((m) => m.target);
  }
}

module.exports = new AnswerMapRepo();
