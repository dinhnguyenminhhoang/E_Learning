"use strict";

const AnswerMapService = require("../services/answerMap.service");

class AnswerMapController {
  async mapAnswers(req, res) {
    const { answers } = req.body;
    const targets = await AnswerMapService.mapAnswerToTarget(answers);
    return res.status(targets.code).json(targets);
  }
}

module.exports = new AnswerMapController();
