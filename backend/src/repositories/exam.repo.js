"use strict";

const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
const ExamAttempt = require("../models/ExamAttempt");
const { toObjectId } = require("../helpers/idHelper");

class ExamRepository {
  async findQuizzesByIds(ids = []) {
    const objectIds = ids.map((id) => toObjectId(id)).filter(Boolean);
    if (!objectIds.length) return [];
    return Quiz.find({ _id: { $in: objectIds } }).select("_id");
  }

  async createExam(payload) {
    return Exam.create(payload);
  }

  async findExamById(examId) {
    return Exam.findById(examId);
  }

  async createExamAttempt(payload) {
    return ExamAttempt.create(payload);
  }

  async findActiveExamAttempt(userId, examId) {
    return ExamAttempt.findOne({
      user: toObjectId(userId),
      exam: toObjectId(examId),
      status: "in_progress",
    });
  }

  async findExamAttemptById(id) {
    return ExamAttempt.findById(toObjectId(id));
  }

  async updateExamAttempt(attemptId, updateData) {
    return ExamAttempt.findByIdAndUpdate(
      toObjectId(attemptId),
      { $set: updateData },
      { new: true }
    );
  }
}

module.exports = new ExamRepository();

     