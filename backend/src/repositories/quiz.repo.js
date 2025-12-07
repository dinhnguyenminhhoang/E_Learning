"use strict";

const { STATUS } = require("../constants/status.constans");
const Quiz = require("../models/Quiz");

class QuizRepository {
  async createQuiz(data) {
    return await Quiz.create(data);
  }

  async getQuizById(id) {
    return await Quiz.findById(id);
  }

  async getQuizByTitleAndAttachedTo(title, attachedTo) {
    const query = { title };
    if (attachedTo && attachedTo.kind && attachedTo.item) {
      query["attachedTo.kind"] = attachedTo.kind;
      query["attachedTo.item"] = attachedTo.item;
    }
    return await Quiz.findOne(query);
  }

  async getAllQuizzes(req) {
    const {
      pageNum = 1,
      pageSize = 10,
      attachedKind,
      attachedItem,
      search,
      status,
      skill,
      difficulty,
    } = req.query;

    const filter = { status: { $ne: `${STATUS.DELETED}` } };
    if (attachedKind && attachedItem) {
      filter["attachedTo.kind"] = attachedKind;
      filter["attachedTo.item"] = attachedItem;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (skill && skill !== "all") {
      filter.skill = skill;
    }

    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (pageNum - 1) * pageSize;
    const limit = parseInt(pageSize);

    const [quiz, total] = await Promise.all([
      Quiz.find(filter)
        .populate("title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quiz.countDocuments(filter),
    ]);

    return {
      total,
      pageNum: parseInt(pageNum),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize),
      quiz,
    };
  }

  async updateQuiz(id, updates) {
    return await Quiz.findByIdAndUpdate(id, updates, { new: true });
  }

  async addQuestions(quizId, questions) {
    return await Quiz.findByIdAndUpdate(
      quizId,
      {
        $push: { questions: { $each: questions } },
      },
      { new: true }
    );
  }

  async deleteSoftQuiz(id) {
    return await Quiz.findByIdAndUpdate(
      id,
      { status: STATUS.DELETED },
      { new: true }
    );
  }

  async deleteHardQuiz(id) {
    return await Quiz.findByIdAndDelete(id);
  }

  async updateQuestion(quizId, questionId, questionData) {
    return await Quiz.findOneAndUpdate(
      { _id: quizId, "questions._id": questionId },
      {
        $set: {
          "questions.$": { ...questionData, _id: questionId }
        }
      },
      { new: true }
    );
  }

  async deleteQuestion(quizId, questionId) {
    return await Quiz.findByIdAndUpdate(
      quizId,
      {
        $pull: { questions: { _id: questionId } }
      },
      { new: true }
    );
  }
}
module.exports = new QuizRepository();
