"use strict";

const examService = require("../services/exam.Service");

class ExamController {
  // ===== ADMIN METHODS =====
  async getAllExams(req, res) {
    const result = await examService.getAllExams(req);
    return res.status(result.code).json(result);
  }

  async getExamById(req, res) {
    const result = await examService.getExamById(req);
    return res.status(result.code).json(result);
  }

  async createExam(req, res) {
    const result = await examService.createExam(req);
    return res.status(result.code).json(result);
  }

  async updateExam(req, res) {
    const result = await examService.updateExam(req);
    return res.status(result.code).json(result);
  }

  async deleteExam(req, res) {
    const result = await examService.deleteExam(req);
    return res.status(result.code).json(result);
  }

  // ===== USER METHODS =====
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

  async getMyExamAttempts(req, res) {
    console.log("rning heare");
    const result = await examService.getMyExamAttempts(req);
    return res.status(result.code).json(result);
  }

  async getAvailableExams(req, res) {
    const result = await examService.getAvailableExams(req);
    return res.status(result.code).json(result);
  }
}

module.exports = new ExamController();
