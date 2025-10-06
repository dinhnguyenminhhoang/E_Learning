"use strict";

const AnswerMapRepo = require("../repositories/answerMap.repo");

class AnswerMapService {
  async mapAnswerToTarget(answers) {
    return AnswerMapRepo.findMappedTargetsByAnswers(answers);
  }
}

module.exports = new AnswerMapService();
