"use strict";

const AnswerMap = require("../models/AnswerMap");

class AnswerMapRepo {
  async findMappedTargetsByAnswers(answers) {
    const mappings = await AnswerMap.find({
      questionKey: { $in: answers.map((a) => a.questionKey) },
      rawValue: { $in: answers.flatMap((a) => a.answerKeys) },
    })
      .populate("target")
      .populate("learningPath");
    return mappings.map((m) => ({
      target: m.target,
      learningPath: m.learningPath,
    }));
  }
}

module.exports = new AnswerMapRepo();
