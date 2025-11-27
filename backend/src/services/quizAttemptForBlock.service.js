"use strict";

const QuizAttemptForBlockRepo = require("../repositories/quizAttemptForBlock.repo");
const UserBlockProgressService = require("./userBlockProgress.service");
const QuizRepository = require("../repositories/quiz.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { HTTP_STATUS } = require("../constants/httpStatus");
const LessonRepository = require("../repositories/lesson.repo");
const UserBlockProgressRepo = require("../repositories/userBlockProgress.repo");

class QuizAttemptForBlockService {
  async startQuizAttempt(userId, blockId) {
    const blockProgress = await UserBlockProgressRepo.findByUserAndBlock(
      userId,
      blockId
    );

    if (!blockProgress) {
      return ResponseBuilder.notFoundError();
    }

    if (blockProgress.isLocked) {
      return ResponseBuilder.forbiddenError();
    }

    const lesson = await LessonRepository.getLessonById(blockProgress.lesson);
    if (!lesson) {
      return ResponseBuilder.notFoundError();
    }

    const blockInLesson = lesson.blocks.find(
      (b) => b.block.toString() === blockId.toString()
    );

    if (!blockInLesson || !blockInLesson.exercise) {
      return ResponseBuilder.badRequest("Block này không có bài tập.");
    }

    const quizId = blockInLesson.exercise;

    const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!quiz) {
      return ResponseBuilder.notFoundError();
    }

    const existingAttempt = await QuizAttemptForBlockRepo.findOne({
      user: userId,
      block: blockId,
      quiz: quizId,
      status: "in_progress",
    });

    if (existingAttempt && existingAttempt.answers.length === 0) {
      return ResponseBuilder.success(
        "Bạn đang có quiz đang làm dở.",
        existingAttempt
      );
    }

    const attemptData = {
      user: userId,
      quiz: quizId,
      block: blockId,
      userBlockProgress: blockProgress._id,
      totalQuestions: quiz.questions.length,
      status: "in_progress",
    };

    const newAttempt = await QuizAttemptForBlockRepo.create(attemptData);

    return ResponseBuilder.success("Bắt đầu làm quiz thành công!", newAttempt);
  }

  async submitQuiz(userId, attemptId, answers) {
    const attempt = await QuizAttemptForBlockRepo.findById(attemptId);

    if (!attempt) {
      return ResponseBuilder.notFoundError();
    }

    if (attempt.user.toString() !== userId.toString()) {
      return ResponseBuilder.forbiddenError();
    }

    if (attempt.status === "completed") {
      return ResponseBuilder.badRequest("Quiz đã được nộp trước đó.");
    }

    const quiz = await QuizRepository.getQuizById(attempt.quiz);
    if (!quiz) {
      return ResponseBuilder.notFoundError();
    }

    const gradedAnswers = await this._gradeAnswers(quiz.questions, answers);

    const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
    const totalCount = quiz.questions.length;

    await attempt.finishAttempt(gradedAnswers, correctCount, totalCount);

    const isPassed = attempt.isPassed;

    await UserBlockProgressService.recordQuizAttempt(
      userId,
      attempt.block,
      attempt.percentage,
      isPassed
    );

    const message = isPassed
      ? "Chúc mừng! Bạn đã hoàn thành quiz với 100%!"
      : `Bạn đạt ${attempt.percentage}%. Cần 100% để pass. Vui lòng thử lại.`;

    return ResponseBuilder.success(message, {
      attempt,
      isPassed,
      score: attempt.percentage,
      correctAnswers: correctCount,
      totalQuestions: totalCount,
    });
  }

  async _gradeAnswers(questions, userAnswers) {
    return questions.map((question, index) => {
      const userAnswer = userAnswers[index];
      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === "multiple_choice") {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        isCorrect = userAnswer?.selectedAnswer === correctOption?.text;
      } else if (question.type === "fill_blank") {
        isCorrect =
          userAnswer?.selectedAnswer?.trim().toLowerCase() ===
          question.correctAnswer?.trim().toLowerCase();
      } else if (question.type === "true_false") {
        isCorrect =
          userAnswer?.selectedAnswer?.toLowerCase() ===
          question.correctAnswer?.toLowerCase();
      }

      if (isCorrect) {
        pointsEarned = question.points || 1;
      }

      return {
        questionId: question._id,
        selectedAnswer: userAnswer?.selectedAnswer || "",
        isCorrect,
        pointsEarned,
        timeSpent: userAnswer?.timeSpent || 0,
      };
    });
  }

  async getAttemptHistory(userId, blockId) {
    const attempts = await QuizAttemptForBlockRepo.findByUserAndBlock(
      userId,
      blockId
    );

    return ResponseBuilder.success(
      "Lấy lịch sử quiz attempts thành công!",
      attempts
    );
  }

  async getAttemptDetail(userId, attemptId) {
    const attempt = await QuizAttemptForBlockRepo.findById(attemptId);

    if (!attempt) {
      return ResponseBuilder.notFoundError();
    }

    if (attempt.user.toString() !== userId.toString()) {
      return ResponseBuilder.forbiddenError();
    }

    return ResponseBuilder.success(
      "Lấy chi tiết quiz attempt thành công!",
      attempt
    );
  }

  async retryQuiz(userId, blockId) {
    const passedAttempt = await QuizAttemptForBlockRepo.findPassedAttempt(
      userId,
      blockId
    );

    if (passedAttempt) {
      return ResponseBuilder.badRequest("Bạn đã pass quiz này rồi. Không cần làm lại.");
    }

    return await this.startQuizAttempt(userId, blockId);
  }
}

module.exports = new QuizAttemptForBlockService();
