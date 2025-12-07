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

  async findExamById(examId, options = {}) {
    const { populateSections = false } = options;

    const query = Exam.findById(examId);

    if (populateSections) {
      query.populate({
        path: 'sections.quiz',
        select: 'title skill questions xpReward difficulty',
      });
    }

    return query;
  }

  async findExams(filter = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

    return Exam.find(filter)
      .select('title description status totalTimeLimit sections createdAt updatedAt')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countExams(filter = {}) {
    return Exam.countDocuments(filter);
  }

  async updateExam(examId, updateData) {
    return Exam.findByIdAndUpdate(
      toObjectId(examId),
      { $set: updateData },
      { new: true }
    );
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

  async countActiveAttempts(examId) {
    return ExamAttempt.countDocuments({
      exam: toObjectId(examId),
      status: "in_progress",
    });
  }
}

module.exports = new ExamRepository();

