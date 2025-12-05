"use strict";

const examService = require("../services/exam.Service");

class ExamController {
  async createExam(req, res) {
    const result = await examService.createExam(req);
    return res.status(result.code).json(result);
  }

  async startExam(req, res) {
    const result = await examService.startExam(req);
    return res.status(result.code).json(result);
  }

  async getSectionQuestions(req, res) {
    const result = await examService.getSectionQuestions(req);
    return res.status(result.code).json(result);
  }

  async submitSection(req, res) {
    const result = await examService.submitSection(req);
    return res.status(result.code).json(result);
  }

  async completeExam(req, res) {
    const result = await examService.completeExam(req);
    return res.status(result.code).json(result);
  }

  async getExamAttemptResult(req, res) {
    const result = await examService.getExamAttemptResult(req);
    return res.status(result.code).json(result);
  }
}

module.exports = new ExamController();




