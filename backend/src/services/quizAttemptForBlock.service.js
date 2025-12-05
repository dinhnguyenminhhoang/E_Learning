"use strict";

const QuizAttemptForBlockRepo = require("../repositories/quizAttemptForBlock.repo");
const UserBlockProgressService = require("./userBlockProgress.service");
const QuizRepository = require("../repositories/quiz.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { HTTP_STATUS } = require("../constants/httpStatus");
const LessonRepository = require("../repositories/lesson.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const BlockRepository = require("../repositories/block.repo");

class QuizAttemptForBlockService {
  /**
   * Bắt đầu làm quiz cho một block
   * - Kiểm tra xem đã có quizAttemptForBlock chưa
   * - Nếu có → return attempt đó kèm thông tin quiz
   * - Nếu chưa có → tạo mới và return kèm thông tin quiz
   * @param {String} userId - ID của user
   * @param {String} blockId - ID của block
   * @returns {Object} Response object với quiz attempt và quiz info
   */
  async startQuizAttempt(userId, blockId) {
    try {
      // Validate block tồn tại
      const block = await BlockRepository.getBlockById(toObjectId(blockId));
      if (!block) {
        return ResponseBuilder.notFoundError("Block not found");
      }

      // Lấy lessonId từ block
      let lessonId = block.lessonId;
      if (!lessonId) {
        // Nếu block không có lessonId, tìm từ Lesson
        const lessons = await LessonRepository.getLessonsByBlockId(blockId);
        if (lessons && lessons.length > 0) {
          lessonId = lessons[0]._id;
        }
      }

      if (!lessonId) {
        return ResponseBuilder.notFoundError("Lesson not found for this block");
      }

      // Lấy lesson để kiểm tra block có quiz không
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (!lesson) {
        return ResponseBuilder.notFoundError("Lesson not found");
      }

      // Tìm block trong lesson để lấy exercise (quiz)
      const blockInLesson = lesson.blocks.find(
        (b) => {
          const blockIdStr = b.block?.toString() || b.block?._id?.toString();
          return blockIdStr === blockId.toString();
        }
      );

      if (!blockInLesson || !blockInLesson.exercise) {
        return ResponseBuilder.badRequest("Block này không có bài tập.");
      }

      const quizId = blockInLesson.exercise;

      // Lấy thông tin quiz
      const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
      if (!quiz) {
        return ResponseBuilder.notFoundError("Quiz not found");
      }

      // Kiểm tra xem đã có quizAttemptForBlock cho block này chưa
      const existingAttempt = await QuizAttemptForBlockRepo.findLatestAttempt(
        toObjectId(userId),
        toObjectId(blockId)
      );

      // Nếu đã có attempt, populate quiz và return
      if (existingAttempt) {
        const attemptWithQuiz = await QuizAttemptForBlockRepo.findById(
          existingAttempt._id
        );

        // Sanitize quiz để bỏ isCorrect từ options
        const sanitizedQuiz = this._sanitizeQuizForUser(quiz);
        
        // Convert attempt to plain object và sanitize quiz trong attempt
        const attemptObj = attemptWithQuiz.toObject
          ? attemptWithQuiz.toObject()
          : { ...attemptWithQuiz };
        
        if (attemptObj.quiz) {
          attemptObj.quiz = this._sanitizeQuizForUser(attemptObj.quiz);
        }

        return ResponseBuilder.success(
          "Lấy quiz attempt thành công",
          {
            attempt: attemptObj,
            quiz: sanitizedQuiz,
          }
        );
      }

      // Nếu chưa có attempt, tạo mới
      // Note: userBlockProgress field vẫn required trong model QuizAttemptForBlock
      // nhưng không sử dụng nữa (đã chuyển sang UserProgress)
      // Temporary: sử dụng userId làm placeholder cho đến khi update model
      const attemptData = {
        user: toObjectId(userId),
        quiz: toObjectId(quizId),
        block: toObjectId(blockId),
        userBlockProgress: toObjectId(userId), // Placeholder - không sử dụng
        totalQuestions: quiz.questions?.length || 0,
        status: "in_progress",
      };

      const newAttempt = await QuizAttemptForBlockRepo.create(attemptData);

      // Populate quiz cho attempt mới tạo
      const attemptWithQuiz = await QuizAttemptForBlockRepo.findById(
        newAttempt._id
      );

      // Sanitize quiz để bỏ isCorrect từ options
      const sanitizedQuiz = this._sanitizeQuizForUser(quiz);
      
      // Convert attempt to plain object và sanitize quiz trong attempt
      const attemptObj = attemptWithQuiz.toObject
        ? attemptWithQuiz.toObject()
        : { ...attemptWithQuiz };
      
      if (attemptObj.quiz) {
        attemptObj.quiz = this._sanitizeQuizForUser(attemptObj.quiz);
      }

      return ResponseBuilder.success("Bắt đầu làm quiz thành công!", {
        attempt: attemptObj,
        quiz: sanitizedQuiz,
      });
    } catch (error) {
      console.error(
        `[QuizAttemptForBlockService] Error starting quiz attempt for user ${userId}, block ${blockId}:`,
        error
      );
      return ResponseBuilder.error(
        "Failed to start quiz attempt",
        500,
        error.message
      );
    }
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

  /**
   * Sanitize quiz để bỏ field isCorrect từ options khi trả về cho user
   * Chỉ áp dụng cho type "multiple_choice" và "fill_blank"
   * @private
   * @param {Object} quiz - Quiz object (có thể là Mongoose document hoặc plain object)
   * @returns {Object} Sanitized quiz object
   */
  _sanitizeQuizForUser(quiz) {
    if (!quiz) {
      return quiz;
    }

    // Convert Mongoose document to plain object nếu cần
    const quizObj = quiz.toObject ? quiz.toObject() : quiz;

    // Clone quiz để không modify original
    const sanitizedQuiz = JSON.parse(JSON.stringify(quizObj));

    // Sanitize questions
    if (sanitizedQuiz.questions && Array.isArray(sanitizedQuiz.questions)) {
      sanitizedQuiz.questions = sanitizedQuiz.questions.map((question) => {
        // Chỉ sanitize cho multiple_choice và fill_blank
        if (
          (question.type === "multiple_choice" ||
            question.type === "fill_blank") &&
          question.options &&
          Array.isArray(question.options)
        ) {
          // Loại bỏ isCorrect từ mỗi option
          question.options = question.options.map((option) => {
            const { isCorrect, ...optionWithoutIsCorrect } = option;
            return optionWithoutIsCorrect;
          });
        }

        return question;
      });
    }

    return sanitizedQuiz;
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
