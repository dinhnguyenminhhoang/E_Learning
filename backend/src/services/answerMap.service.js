"use strict";

const { SUCCESS } = require("../constants/responseMessage");
const AnswerMapRepo = require("../repositories/answerMap.repo");
const ResponseBuilder = require("../types/response/baseResponse");

class AnswerMapService {
  async mapAnswerToTarget(answers) {
    const targets = await AnswerMapRepo.findMappedTargetsByAnswers(answers);
    if (!targets || targets.length === 0)
      return ResponseBuilder.notFoundError();
    return ResponseBuilder.success(SUCCESS.FETCHED, targets);
  }
}

module.exports = new AnswerMapService();
