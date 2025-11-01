"use strict";

const QuizRepository = require("../repositories/quiz.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { STATUS } = require("../constants/status.constans");
const HTTP_STATUS = require("../constants/httpStatus");

class QuizService {

  async createQuiz(req) {
    const quizData = {
      title: req.body.title,
      attachedTo: req.body.attachedTo, 
      questions: req.body.questions || [],
      xpReward: req.body.xpReward || 50,
      status: STATUS.DRAFT,
      thumbnail: req.body.thumbnail || "",
      audio: req.body.audio || "",
      tags: req.body.tags || "",
      updatedBy: req.user?.id || null,
    };

    const existingQuiz = await QuizRepository.getQuizByTitleAndAttachedTo(
      quizData.title,
      quizData.attachedTo
    );

    if (existingQuiz) {
      if (existingQuiz.status === STATUS.DELETED) {
        const restored = await QuizRepository.updateQuiz(
          existingQuiz._id,
          quizData
        );
        return ResponseBuilder.success({
          message: "Tạo quiz thành công!",
          data: restored,
        });
      }
      return ResponseBuilder.duplicateError("Quiz đã tồn tại");
    }

    const added = await QuizRepository.createQuiz(quizData);
    return ResponseBuilder.success({
      message: "Tạo quiz thành công!",
      data: added,
    });
  }

  async getQuizById(req) {
    const quizId = req.params.id;
    const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!quiz) return ResponseBuilder.error(
      "Không tìm thấy quiz.",
      HTTP_STATUS.NOT_FOUND
    );
    return ResponseBuilder.success({
      message: "Lấy dữ liệu quiz thành công",
      data: quiz,
    });
  }

  async getAllQuizzes(req) {
    const quizzes = await QuizRepository.getAllQuizzes(req);
    return ResponseBuilder.success({
      message: "Lấy danh sách quiz thành công",
      data: quizzes,
      pagination: {
        total: quizzes.total,
        pageNum: quizzes.pageNum,
        pageSize: quizzes.pageSize,
        totalPages: quizzes.totalPages,
      },
    });
  }

  async updateQuiz(req) {
    const quizId = req.params.id;
    const quizUpdates = req.body;
    const existingQuiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!existingQuiz) return ResponseBuilder.error(
      "Không tìm thấy quiz.",
      HTTP_STATUS.NOT_FOUND
    );

    if (quizUpdates.title && quizUpdates.title !== existingQuiz.title) {
      const quizWithSameTitle =
        await QuizRepository.getQuizByTitleAndAttachedTo(
          quizUpdates.title,
          existingQuiz.attachedTo
        );
      if (quizWithSameTitle) {
        if (quizWithSameTitle.status !== STATUS.DELETED) {
          return ResponseBuilder.duplicateError("Quiz đã tồn tại.");
        }
        await QuizRepository.deleteHardQuiz(quizWithSameTitle._id);
      }
    }

    quizUpdates.updatedAt = new Date();
    quizUpdates.updatedBy = req.user?.id || null;

    const updatedQuiz = await QuizRepository.updateQuiz(quizId, quizUpdates);
    return ResponseBuilder.success({
      message: "Cập nhật quiz thành công",
      data: updatedQuiz,
    });
  }

  async deleteQuiz(req) {
    const quizId = req.params.id;
    const existingQuiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!existingQuiz) return ResponseBuilder.error(
      "Không tìm thấy quiz.",
      HTTP_STATUS.NOT_FOUND
    );

    await QuizRepository.deleteSoftQuiz(toObjectId(quizId));
    return ResponseBuilder.success("Xóa dữ liệu quiz thành công");
  }
}

module.exports = new QuizService();
