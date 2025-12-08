"use strict";

const QuizAttemptForBlockRepo = require("../repositories/quizAttemptForBlock.repo");
const QuizRepository = require("../repositories/quiz.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { HTTP_STATUS } = require("../constants/httpStatus");
const LessonRepository = require("../repositories/lesson.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const BlockRepository = require("../repositories/block.repo");
const QuizAttemptForBlockRepository = require("../repositories/quizAttemptForBlock.repo");

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
      const blockInLesson = lesson.blocks.find((b) => {
        const blockIdStr = b.block?.toString() || b.block?._id?.toString();
        return blockIdStr === blockId.toString();
      });

      if (!blockInLesson || !blockInLesson.exercise) {
        // Đánh dấu block là completed vì không có bài tập
        await this._markBlockCompletedWhenNoExercise(userId, blockId, lessonId);
        
        return ResponseBuilder.success("Đã hoàn thành block này. Block không có bài tập.", {
          hasExercise: false,
          blockCompleted: true,
          message: "Đã hoàn thành block này vì block không có bài tập.",
        });
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

        return ResponseBuilder.success("Lấy quiz attempt thành công", {
          attempt: attemptObj,
          quiz: sanitizedQuiz,
        });
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

  /**
   * Chấm điểm và lưu kết quả quiz attempt
   * - Validate attempt và answers
   * - Chấm điểm từng câu hỏi
   * - Tính toán score, percentage, isPassed
   * - Lưu kết quả vào attempt
   * - Cập nhật UserProgress nếu pass quiz
   * @param {String} userId - ID của user
   * @param {String} attemptId - ID của quiz attempt
   * @param {Array} answers - Mảng các câu trả lời của user
   * @returns {Object} Response object với kết quả quiz
   */
  async submitQuiz(userId, attemptId, answers) {
    try {
      // Validate attempt tồn tại và thuộc về user
      const attempt = await QuizAttemptForBlockRepo.findById(attemptId);
      if (!attempt) {
        return ResponseBuilder.notFoundError("Không tìm thấy quiz attempt.");
      }

      if (attempt.user.toString() !== userId.toString()) {
        return ResponseBuilder.forbiddenError(
          "Bạn không có quyền truy cập quiz attempt này."
        );
      }

      if (attempt.status === "completed") {
        return ResponseBuilder.badRequest("Quiz đã được nộp trước đó.");
      }

      // Lấy quiz để chấm điểm
      const quiz = await QuizRepository.getQuizById(attempt.quiz);
      if (!quiz) {
        return ResponseBuilder.notFoundError("Không tìm thấy quiz.");
      }

      // Validate answers tồn tại
      if (!answers) {
        return ResponseBuilder.badRequest("Answers không được để trống.");
      }

      // Validate answers format và số lượng
      const validationError = this._validateAnswers(answers, quiz.questions);
      if (validationError) {
        return ResponseBuilder.badRequest(validationError);
      }

      // Chấm điểm từng câu hỏi
      const gradedAnswers = this._gradeAnswers(quiz.questions, answers);

      // Tính toán kết quả
      const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
      const totalCount = quiz.questions.length;
      const totalTimeSpent = this._calculateTotalTimeSpent(gradedAnswers);

      // Cập nhật timeSpent trước khi finish attempt
      if (totalTimeSpent > 0) {
        attempt.timeSpent = totalTimeSpent;
      }

      // Cập nhật attempt với kết quả
      await attempt.finishAttempt(gradedAnswers, correctCount, totalCount);

      // Reload attempt để lấy dữ liệu mới nhất (bao gồm isPassed, percentage, etc.)
      const updatedAttempt = await QuizAttemptForBlockRepo.findById(attemptId);
      const isPassed = updatedAttempt.isPassed;

      // Nếu pass quiz, cập nhật UserProgress
      if (isPassed) {
        await this._updateUserProgressAfterQuizPass(
          userId,
          updatedAttempt.block,
          updatedAttempt.quiz
        );
      }

      // Tạo response message
      const PASS_THRESHOLD = 65;
      const message = isPassed
        ? `Chúc mừng! Bạn đã hoàn thành quiz với ${updatedAttempt.percentage.toFixed(1)}%!`
        : `Bạn đạt ${updatedAttempt.percentage.toFixed(1)}%. Cần >= ${PASS_THRESHOLD}% để pass. Vui lòng thử lại.`;

      return ResponseBuilder.success(message, {
        attempt: updatedAttempt,
        isPassed,
        score: updatedAttempt.percentage,
        correctAnswers: correctCount,
        totalQuestions: totalCount,
        timeSpent: totalTimeSpent,
      });
    } catch (error) {
      console.error(
        `[QuizAttemptForBlockService] Error submitting quiz for user ${userId}, attempt ${attemptId}:`,
        error
      );
      return ResponseBuilder.error("Failed to submit quiz", 500, error.message);
    }
  }

  /**
   * Chấm điểm từng câu hỏi
   * Hỗ trợ 2 cách mapping:
   * 1. Theo questionId (khuyến nghị): Gửi kèm questionId trong mỗi answer
   * 2. Theo index (backward compatible): Dựa vào thứ tự trong mảng
   * @private
   * @param {Array} questions - Mảng các câu hỏi từ quiz
   * @param {Array} userAnswers - Mảng các câu trả lời của user (có thể có questionId hoặc không)
   * @returns {Array} Mảng các câu trả lời đã được chấm điểm
   */
  _gradeAnswers(questions, userAnswers) {
    // Tạo map để lookup nhanh theo questionId
    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    // Tạo map userAnswers theo questionId nếu có
    const answerMapById = new Map();
    userAnswers.forEach((answer, index) => {
      if (answer.questionId) {
        answerMapById.set(answer.questionId.toString(), answer);
      }
    });

    // Kiểm tra xem có sử dụng questionId không
    const useQuestionId = answerMapById.size > 0;

    return questions.map((question, index) => {
      // Tìm userAnswer theo questionId hoặc index
      let userAnswer = null;
      if (useQuestionId) {
        userAnswer = answerMapById.get(question._id.toString()) || null;
      } else {
        // Backward compatible: dùng index
        userAnswer = userAnswers[index] || null;
      }

      if (!userAnswer) {
        // Không có answer cho câu hỏi này
        return {
          questionId: question._id,
          selectedAnswer: "",
          isCorrect: false,
          pointsEarned: 0,
          timeSpent: 0,
        };
      }

      let isCorrect = false;
      let pointsEarned = 0;

      try {
        switch (question.type) {
          case "multiple_choice":
            // Tìm option đúng
            const correctOption = question.options?.find(
              (opt) => opt.isCorrect
            );
            if (correctOption) {
              // So sánh text (case-insensitive, trim whitespace)
              isCorrect =
                userAnswer?.selectedAnswer?.trim().toLowerCase() ===
                correctOption.text?.trim().toLowerCase();
            }
            break;

          case "fill_blank":
            // So sánh với correctAnswer (case-insensitive, trim)
            const userAnswerText =
              userAnswer?.selectedAnswer?.trim().toLowerCase() || "";
            const correctAnswerText =
              question.correctAnswer?.trim().toLowerCase() || "";
            isCorrect = userAnswerText === correctAnswerText;
            break;

          case "true_false":
            // So sánh true/false (case-insensitive)
            const userAnswerTF =
              userAnswer?.selectedAnswer?.trim().toLowerCase() || "";
            const correctAnswerTF =
              question.correctAnswer?.trim().toLowerCase() || "";
            isCorrect = userAnswerTF === correctAnswerTF;
            break;

          case "matching":
            // Matching: so sánh mảng các cặp key-value
            // Format: [{ key: "A", value: "1" }, { key: "B", value: "2" }]
            if (
              Array.isArray(userAnswer?.selectedAnswer) &&
              Array.isArray(question.correctAnswer)
            ) {
              // So sánh từng cặp
              if (
                userAnswer.selectedAnswer.length ===
                question.correctAnswer.length
              ) {
                isCorrect = userAnswer.selectedAnswer.every((pair) => {
                  const correctPair = question.correctAnswer.find(
                    (cp) => cp.key === pair.key
                  );
                  return correctPair && correctPair.value === pair.value;
                });
              }
            }
            break;

          default:
            console.warn(
              `[QuizAttemptForBlockService] Unknown question type: ${question.type}`
            );
            isCorrect = false;
        }
      } catch (error) {
        console.error(
          `[QuizAttemptForBlockService] Error grading question ${question._id}:`,
          error
        );
        isCorrect = false;
      }

      // Tính điểm nếu đúng
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
   * Validate format và số lượng answers
   * Hỗ trợ 2 cách:
   * 1. Với questionId: Mỗi answer có questionId để map chính xác
   * 2. Không có questionId: Dựa vào thứ tự trong mảng (backward compatible)
   * @private
   * @param {Array} answers - Mảng các câu trả lời
   * @param {Array} questions - Mảng các câu hỏi
   * @returns {String|null} Error message nếu có lỗi, null nếu hợp lệ
   */
  _validateAnswers(answers, questions) {
    // Kiểm tra answers có tồn tại không
    if (answers === undefined || answers === null) {
      return "Answers không được để trống.";
    }

    // Kiểm tra answers có phải là mảng không
    if (!Array.isArray(answers)) {
      return `Answers phải là một mảng. Nhận được: ${typeof answers}`;
    }

    if (answers.length !== questions.length) {
      return `Số lượng câu trả lời (${answers.length}) không khớp với số lượng câu hỏi (${questions.length}).`;
    }

    // Tạo map questions theo ID để validate questionId
    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    // Kiểm tra xem có sử dụng questionId không
    const hasQuestionId = answers.some((a) => a.questionId);
    const allHaveQuestionId = answers.every((a) => a.questionId);

    if (hasQuestionId && !allHaveQuestionId) {
      return "Nếu sử dụng questionId, tất cả answers phải có questionId.";
    }

    // Validate từng answer
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      if (!answer || typeof answer !== "object") {
        return `Câu trả lời thứ ${i + 1} không hợp lệ.`;
      }

      // Validate questionId nếu có
      if (hasQuestionId) {
        if (!answer.questionId) {
          return `Câu trả lời thứ ${i + 1} thiếu questionId.`;
        }

        const questionIdStr = answer.questionId.toString();
        if (!questionMap.has(questionIdStr)) {
          return `Câu trả lời thứ ${i + 1} có questionId không hợp lệ: ${questionIdStr}.`;
        }
      }

      // Lấy question để validate selectedAnswer
      let question = null;
      if (hasQuestionId) {
        question = questionMap.get(answer.questionId.toString());
      } else {
        question = questions[i];
      }

      if (!question) {
        return `Không tìm thấy câu hỏi cho câu trả lời thứ ${i + 1}.`;
      }

      // Validate selectedAnswer dựa trên question type
      if (question.type === "matching") {
        if (!Array.isArray(answer.selectedAnswer)) {
          return `Câu trả lời thứ ${i + 1} (matching) phải có selectedAnswer là một mảng.`;
        }
      } else {
        if (
          answer.selectedAnswer === undefined ||
          answer.selectedAnswer === null ||
          (typeof answer.selectedAnswer !== "string" &&
            typeof answer.selectedAnswer !== "number")
        ) {
          return `Câu trả lời thứ ${i + 1} phải có selectedAnswer.`;
        }
      }

      // Validate timeSpent (optional nhưng nếu có phải là số >= 0)
      if (
        answer.timeSpent !== undefined &&
        (typeof answer.timeSpent !== "number" || answer.timeSpent < 0)
      ) {
        return `timeSpent của câu trả lời thứ ${i + 1} phải là số >= 0.`;
      }
    }

    return null;
  }

  /**
   * Tính tổng thời gian làm quiz
   * @private
   * @param {Array} gradedAnswers - Mảng các câu trả lời đã chấm điểm
   * @returns {Number} Tổng thời gian (giây)
   */
  _calculateTotalTimeSpent(gradedAnswers) {
    return gradedAnswers.reduce((total, answer) => {
      return total + (answer.timeSpent || 0);
    }, 0);
  }

  /**
   * Cập nhật UserProgress sau khi pass quiz
   * - Tìm learningPathId từ UserLearningPath
   * - Tìm lessonId từ block
   * - Tạo block progress nếu chưa có
   * - Đánh dấu block: isCompleted = true (luôn luôn khi pass quiz)
   * - Kiểm tra và cập nhật lesson completion nếu cần
   * @private
   * @param {String} userId - ID của user
   * @param {String} blockId - ID của block
   * @param {String} quizId - ID của quiz
   */
  async _updateUserProgressAfterQuizPass(userId, blockId, quizId) {
    try {
      // Lấy block để tìm lessonId
      const block = await BlockRepository.getBlockById(toObjectId(blockId));
      if (!block) {
        console.warn(
          `[QuizAttemptForBlockService] Block ${blockId} not found when updating progress`
        );
        return;
      }

      // Lấy lessonId từ block
      let lessonId = block.lessonId;
      if (!lessonId) {
        const lessons = await LessonRepository.getLessonsByBlockId(blockId);
        if (lessons && lessons.length > 0) {
          lessonId = lessons[0]._id;
        }
      }

      if (!lessonId) {
        console.warn(
          `[QuizAttemptForBlockService] Lesson not found for block ${blockId}`
        );
        return;
      }

      // Lấy learningPathId từ UserLearningPath
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (!userPaths || userPaths.length === 0) {
        console.warn(
          `[QuizAttemptForBlockService] Learning path not found for user ${userId}`
        );
        return;
      }

      const learningPathId = userPaths[0].learningPath.toString();

      // Lấy hoặc tạo UserProgress
      let progress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      if (!progress) {
        // Tạo UserProgress nếu chưa có
        progress = await UserProgressRepository.findOrCreate(
          userId,
          learningPathId
        );
      }

      // Đảm bảo block progress tồn tại (tạo nếu chưa có)
      // Sử dụng updateBlockProgress với maxWatchedTime = 0 để tạo block progress
      await UserProgressRepository.updateBlockProgress(
        userId,
        learningPathId,
        lessonId,
        blockId,
        0, // maxWatchedTime
        0 // videoDuration
      );

      // Reload progress để lấy dữ liệu mới nhất
      progress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      if (!progress) {
        console.warn(
          `[QuizAttemptForBlockService] Failed to create/load UserProgress for user ${userId}, path ${learningPathId}`
        );
        return;
      }

      // Lấy lesson progress
      let lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
      if (!lessonProgress) {
        console.warn(
          `[QuizAttemptForBlockService] LessonProgress not found for lesson ${lessonId}`
        );
        return;
      }

      // Lấy block progress (đã được tạo ở trên)
      const blockProgress = lessonProgress.blockProgress.find(
        (bp) => bp.blockId.toString() === blockId.toString()
      );

      if (!blockProgress) {
        console.warn(
          `[QuizAttemptForBlockService] BlockProgress not found for block ${blockId} after creation`
        );
        return;
      }

      // Khi hoàn thành quiz (pass), luôn đánh dấu block là completed
      // Không cần check điều kiện vì pass quiz = block completed
      blockProgress.isCompleted = true;
      blockProgress.completedAt = new Date();
      blockProgress.lastUpdatedAt = new Date();

      // Lưu progress
      await progress.save();

      // Kiểm tra và cập nhật lesson completion
      // Lấy lesson để đếm tổng số blocks
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (lesson && lesson.blocks) {
        const totalBlocksInLesson = lesson.blocks.filter((b) => b.block).length;

        if (totalBlocksInLesson > 0) {
          await UserProgressRepository.checkAndUpdateLessonCompletion(
            userId,
            learningPathId,
            lessonId,
            totalBlocksInLesson
          );
        }
      }
    } catch (error) {
      // Log error nhưng không throw để không làm fail quiz submission
      console.error(
        `[QuizAttemptForBlockService] Error updating user progress after quiz pass for user ${userId}, block ${blockId}:`,
        error
      );
    }
  }

  /**
   * Đánh dấu block là completed khi block không có bài tập
   * @private
   * @param {String} userId - ID của user
   * @param {String} blockId - ID của block
   * @param {String} lessonId - ID của lesson
   */
  async _markBlockCompletedWhenNoExercise(userId, blockId, lessonId) {
    try {
      // Lấy learningPathId từ UserLearningPath
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (!userPaths || userPaths.length === 0) {
        console.warn(
          `[QuizAttemptForBlockService] Learning path not found for user ${userId}`
        );
        return;
      }

      const learningPathId = userPaths[0].learningPath.toString();

      // Lấy hoặc tạo UserProgress
      let progress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      if (!progress) {
        // Tạo UserProgress nếu chưa có
        progress = await UserProgressRepository.findOrCreate(
          userId,
          learningPathId
        );
      }

      // Đảm bảo block progress tồn tại (tạo nếu chưa có)
      await UserProgressRepository.updateBlockProgress(
        userId,
        learningPathId,
        lessonId,
        blockId,
        0, // maxWatchedTime
        0 // videoDuration
      );

      // Reload progress để lấy dữ liệu mới nhất
      progress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      if (!progress) {
        console.warn(
          `[QuizAttemptForBlockService] Failed to create/load UserProgress for user ${userId}, path ${learningPathId}`
        );
        return;
      }

      // Lấy lesson progress
      let lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
      if (!lessonProgress) {
        console.warn(
          `[QuizAttemptForBlockService] LessonProgress not found for lesson ${lessonId}`
        );
        return;
      }

      // Lấy block progress (đã được tạo ở trên)
      const blockProgress = lessonProgress.blockProgress.find(
        (bp) => bp.blockId.toString() === blockId.toString()
      );

      if (!blockProgress) {
        console.warn(
          `[QuizAttemptForBlockService] BlockProgress not found for block ${blockId} after creation`
        );
        return;
      }

      // Đánh dấu block là completed vì không có bài tập
      blockProgress.isCompleted = true;
      blockProgress.completedAt = new Date();
      blockProgress.lastUpdatedAt = new Date();

      // Lưu progress
      await progress.save();

      // Kiểm tra và cập nhật lesson completion
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (lesson && lesson.blocks) {
        const totalBlocksInLesson = lesson.blocks.filter((b) => b.block).length;

        if (totalBlocksInLesson > 0) {
          const isLessonCompleted = await UserProgressRepository.checkAndUpdateLessonCompletion(
            userId,
            learningPathId,
            lessonId,
            totalBlocksInLesson
          );

          if (isLessonCompleted) {
            console.log(
              `[QuizAttemptForBlockService] Lesson ${lessonId} completed for user ${userId}`
            );
          }
        }
      }
    } catch (error) {
      // Log error nhưng không throw để không làm fail request
      console.error(
        `[QuizAttemptForBlockService] Error marking block completed when no exercise for user ${userId}, block ${blockId}:`,
        error
      );
    }
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
      return ResponseBuilder.badRequest(
        "Bạn đã pass quiz này rồi. Không cần làm lại."
      );
    }

    return await this.startQuizAttempt(userId, blockId);
  }
}

module.exports = new QuizAttemptForBlockService();
