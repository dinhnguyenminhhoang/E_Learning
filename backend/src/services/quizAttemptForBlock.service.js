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
const LeaderboardService = require("./leaderboard.service");
const achievementTrackerHelper = require("../helpers/achievementTracker.helper");
const achievementService = require("./achievement.service");

class QuizAttemptForBlockService {

  async startQuizAttempt(userId, blockId) {
    try {

      const block = await BlockRepository.getBlockById(toObjectId(blockId));
      if (!block) {
        return ResponseBuilder.notFoundError("Block not found");
      }
      let lessonId = block.lessonId;
      if (!lessonId) {
        const lessons = await LessonRepository.getLessonsByBlockId(blockId);
        if (lessons && lessons.length > 0) {
          lessonId = lessons[0]._id;
        }
      }

      if (!lessonId) {
        return ResponseBuilder.notFoundError("Không tìm thấy bài học cho nội dung này");
      }

      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (!lesson) {
        return ResponseBuilder.notFoundError("Không tìm thấy bài học cho nội dung này");
      }
      const blockInLesson = lesson.blocks.find((b) => {
        const blockIdStr = b.block?.toString() || b.block?._id?.toString();
        return blockIdStr === blockId.toString();
      });

      if (!blockInLesson || !blockInLesson.exercise) {
        await this._markBlockCompletedWhenNoExercise(userId, blockId, lessonId);

        return ResponseBuilder.success("Đã hoàn thành block này. Block không có bài tập.", {
          hasExercise: false,
          blockCompleted: true,
          message: "Đã hoàn thành block này vì block không có bài tập.",
        });
      }
      const quizId = blockInLesson.exercise;

      const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
      if (!quiz) {
        return ResponseBuilder.notFoundError("Không tìm thấy bài tập cho nội dung này");
      }

      const existingAttempt = await QuizAttemptForBlockRepo.findLatestAttempt(
        toObjectId(userId),
        toObjectId(blockId)
      );

      // Check if existing attempt matches the current quiz
      if (
        existingAttempt &&
        existingAttempt.quiz.toString() === quizId.toString()
      ) {
        const attemptWithQuiz = await QuizAttemptForBlockRepo.findById(
          existingAttempt._id
        );

        console.log("attemptWithQuiz", attemptWithQuiz);
        console.log("quiz", quiz);

        const sanitizedQuiz = this._sanitizeQuizForUser(quiz);

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

      const attemptData = {
        user: toObjectId(userId),
        quiz: toObjectId(quizId),
        block: toObjectId(blockId),
        userBlockProgress: toObjectId(userId),
        totalQuestions: quiz.questions?.length || 0,
        status: "in_progress",
      };
      const newAttempt = await QuizAttemptForBlockRepo.create(attemptData);
      const attemptWithQuiz = await QuizAttemptForBlockRepo.findById(
        newAttempt._id
      );

      const sanitizedQuiz = this._sanitizeQuizForUser(quiz);

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
    try {
      const attempt = await QuizAttemptForBlockRepo.findById(attemptId);
      if (!attempt) {
        return ResponseBuilder.notFoundError("Không tìm thấy quiz attempt.");
      }

      if (attempt.user.toString() !== userId.toString()) {
        return ResponseBuilder.forbiddenError(
          "Bạn không có quyền truy cập quiz attempt này."
        );
      }

      const quiz = await QuizRepository.getQuizById(attempt.quiz);
      if (!quiz) {
        return ResponseBuilder.notFoundError("Không tìm thấy quiz.");
      }
      console.log("quiz", quiz);
      if (!answers) {
        return ResponseBuilder.badRequest("Answers không được để trống.");
      }
      const validationError = this._validateAnswers(answers, quiz.questions);
      if (validationError) {
        return ResponseBuilder.badRequest(validationError);
      }

      const gradedAnswers = this._gradeAnswers(quiz.questions, answers);

      const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
      const totalCount = quiz.questions.length;
      const totalTimeSpent = this._calculateTotalTimeSpent(gradedAnswers);

      if (totalTimeSpent > 0) {
        attempt.timeSpent = totalTimeSpent;
      }

      await attempt.finishAttempt(gradedAnswers, correctCount, totalCount);

      const updatedAttempt = await QuizAttemptForBlockRepo.findById(attemptId);
      const isPassed = updatedAttempt.isPassed;

      if (isPassed) {
        await this._updateUserProgressAfterQuizPass(
          userId,
          updatedAttempt.block,
          updatedAttempt.quiz
        );

        try {
          const xpAmount = quiz.xpReward || 50;
          await LeaderboardService.addXP(
            userId,
            xpAmount,
            "quiz_completion"
          );
        } catch (xpError) {
          console.error(
            `[QuizAttemptForBlockService] Error awarding XP for quiz ${quiz._id}:`,
            xpError
          );
        }

        try {

          await achievementService.checkQuizAchievements(userId, {
            score: updatedAttempt.score,
            percentage: updatedAttempt.percentage,
            isPassed: updatedAttempt.isPassed,
          });

          const timeSpent = updatedAttempt.timeSpent || 600;
          await achievementTrackerHelper.trackLessonCompletion(userId, timeSpent);

          await achievementTrackerHelper.trackDailyStreak(userId);

        } catch (achievementError) {
          console.error(
            `[QuizAttemptForBlockService] Error checking achievements for quiz ${quiz._id}:`,
            achievementError
          );
        }
      }

      // Check if lesson is completed after quiz pass
      let isLessonCompleted = false;
      if (isPassed) {
        try {
          const block = await BlockRepository.getBlockById(toObjectId(updatedAttempt.block));
          if (block) {
            let lessonId = block.lessonId;
            if (!lessonId) {
              const lessons = await LessonRepository.getLessonsByBlockId(updatedAttempt.block);
              if (lessons && lessons.length > 0) {
                lessonId = lessons[0]._id;
              }
            }

            if (lessonId) {
              const userPaths = await UserLearningPathRepository.findByUserId(toObjectId(userId));
              if (userPaths && userPaths.length > 0) {
                const learningPathId = userPaths[0].learningPath.toString();
                const progress = await UserProgressRepository.findByUserAndPath(
                  userId,
                  learningPathId
                );

                if (progress) {
                  const lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
                  if (lessonProgress) {
                    isLessonCompleted = lessonProgress.isCompleted || false;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(
            `[QuizAttemptForBlockService] Error checking lesson completion:`,
            error
          );
          // Don't fail the request if lesson check fails
        }
      }

      const PASS_THRESHOLD = 65;
      const message = isPassed
        ? `Chúc mừng! Bạn đã hoàn thành quiz với ${updatedAttempt.percentage.toFixed(1)}%!`
        : `Bạn đạt ${updatedAttempt.percentage.toFixed(1)}%. Cần >= ${PASS_THRESHOLD}% để pass. Vui lòng thử lại.`;

      return ResponseBuilder.success(message, {
        attempt: updatedAttempt,
        isPassed,
        isBlockCompleted: isPassed,
        isLessonCompleted,
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
   * Parse matching answer from string format to array format
   * String format: "left-0:right-1|left-1:right-0"
   * Array format: [{key: "leftText", value: "rightText"}, ...]
   * @param {string} answerString - Answer string in format "leftId:rightId|leftId:rightId"
   * @param {Array} options - Question options array
   * @returns {Array} Parsed answer array
   */
  _parseMatchingAnswer(answerString, options) {
    if (!answerString || typeof answerString !== "string") {
      return [];
    }

    const result = [];
    const pairs = answerString.split("|").filter(Boolean);

    pairs.forEach((pair) => {
      const [leftId, rightId] = pair.split(":");
      if (!leftId || !rightId) return;

      // Extract index from IDs: "left-0" -> 0, "right-1" -> 1
      const leftMatch = leftId.match(/left-(\d+)/);
      const rightMatch = rightId.match(/right-(\d+)/);

      if (leftMatch && rightMatch) {
        const leftIndex = parseInt(leftMatch[1], 10);
        const rightIndex = parseInt(rightMatch[1], 10);

        // Get option text and parse "leftText - rightText"
        if (options && options[leftIndex] && options[rightIndex]) {
          const leftOption = options[leftIndex];
          const rightOption = options[rightIndex];

          // Parse option text format: "leftText - rightText" or "leftText-rightText"
          const leftText = this._extractLeftText(leftOption.text);
          const rightText = this._extractRightText(rightOption.text);

          if (leftText && rightText) {
            result.push({
              key: leftText.trim(),
              value: rightText.trim(),
            });
          }
        }
      }
    });

    return result;
  }

  /**
   * Extract left text from option text (e.g., "ticket - vé" -> "ticket")
   * @param {string} text - Option text
   * @returns {string} Left text
   */
  _extractLeftText(text) {
    if (!text) return "";
    const separators = [" - ", " – ", " — ", "-"];
    for (const sep of separators) {
      const parts = text.split(sep);
      if (parts.length >= 2) {
        return parts[0].trim();
      }
    }
    return text.trim();
  }

  /**
   * Extract right text from option text (e.g., "ticket - vé" -> "vé")
   * @param {string} text - Option text
   * @returns {string} Right text
   */
  _extractRightText(text) {
    if (!text) return "";
    const separators = [" - ", " – ", " — ", "-"];
    for (const sep of separators) {
      const parts = text.split(sep);
      if (parts.length >= 2) {
        return parts.slice(1).join(sep).trim();
      }
    }
    return "";
  }

  /**
   * Get correct matching pairs from question options
   * @param {Object} question - Question object
   * @returns {Array} Correct pairs array
   */
  _getCorrectMatchingPairs(question) {
    if (!question.options || !Array.isArray(question.options)) {
      return [];
    }

    // If question has correctAnswer as array, use it
    if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer;
    }

    // Otherwise, extract from options with isCorrect=true
    const correctPairs = [];
    question.options.forEach((option) => {
      if (option.isCorrect && option.text) {
        const leftText = this._extractLeftText(option.text);
        const rightText = this._extractRightText(option.text);
        if (leftText && rightText) {
          correctPairs.push({
            key: leftText.trim(),
            value: rightText.trim(),
          });
        }
      }
    });

    return correctPairs;
  }

  _gradeAnswers(questions, userAnswers) {
    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    const answerMapById = new Map();
    userAnswers.forEach((answer, index) => {
      if (answer.questionId) {
        answerMapById.set(answer.questionId.toString(), answer);
      }
    });

    const useQuestionId = answerMapById.size > 0;

    return questions.map((question, index) => {
      let userAnswer = null;
      if (useQuestionId) {
        userAnswer = answerMapById.get(question._id.toString()) || null;
      } else {
        userAnswer = userAnswers[index] || null;
      }

      if (!userAnswer) {
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
            const correctOption = question.options?.find(
              (opt) => opt.isCorrect
            );
            if (correctOption) {
              isCorrect =
                userAnswer?.selectedAnswer?.trim().toLowerCase() ===
                correctOption.text?.trim().toLowerCase();
            }
            break;

          case "fill_blank":
            const userAnswerText =
              userAnswer?.selectedAnswer?.trim().toLowerCase() || "";
            const correctAnswerText =
              question.correctAnswer?.trim().toLowerCase() || "";
            isCorrect = userAnswerText === correctAnswerText;
            break;

          case "true_false":
            const userAnswerTF =
              userAnswer?.selectedAnswer?.trim().toLowerCase() || "";
            const correctAnswerTF =
              question.correctAnswer?.trim().toLowerCase() || "";
            isCorrect = userAnswerTF === correctAnswerTF;
            break;

          case "matching":
            // Convert string format to array format if needed
            let userMatchingAnswer = userAnswer?.selectedAnswer;
            if (typeof userMatchingAnswer === "string") {
              userMatchingAnswer = this._parseMatchingAnswer(
                userMatchingAnswer,
                question.options
              );
            }

            // Get correct pairs
            const correctPairs = this._getCorrectMatchingPairs(question);

            // Compare answers
            if (
              Array.isArray(userMatchingAnswer) &&
              Array.isArray(correctPairs) &&
              userMatchingAnswer.length > 0 &&
              correctPairs.length > 0
            ) {
              // Check if all user pairs match correct pairs (each pair only once)
              if (userMatchingAnswer.length === correctPairs.length) {
                const usedCorrectPairs = new Set();
                isCorrect = userMatchingAnswer.every((userPair) => {
                  const userKey = userPair.key?.trim().toLowerCase();
                  const userValue = userPair.value?.trim().toLowerCase();

                  // Find matching correct pair that hasn't been used
                  const correctPairIndex = correctPairs.findIndex(
                    (cp, idx) => {
                      if (usedCorrectPairs.has(idx)) return false;
                      const correctKey = cp.key?.trim().toLowerCase();
                      const correctValue = cp.value?.trim().toLowerCase();
                      return (
                        correctKey === userKey && correctValue === userValue
                      );
                    }
                  );

                  if (correctPairIndex !== -1) {
                    usedCorrectPairs.add(correctPairIndex);
                    return true;
                  }
                  return false;
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

      if (isCorrect) {
        pointsEarned = question.points || 1;
      }

      // Store answer in original format (string for matching if it was string)
      const storedAnswer =
        question.type === "matching" &&
          typeof userAnswer?.selectedAnswer === "string"
          ? userAnswer.selectedAnswer
          : userAnswer?.selectedAnswer || "";

      return {
        questionId: question._id,
        selectedAnswer: storedAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: userAnswer?.timeSpent || 0,
      };
    });
  }

  _validateAnswers(answers, questions) {
    if (answers === undefined || answers === null) {
      return "Answers không được để trống.";
    }

    if (!Array.isArray(answers)) {
      return `Answers phải là một mảng. Nhận được: ${typeof answers}`;
    }

    if (answers.length !== questions.length) {
      return `Số lượng câu trả lời (${answers.length}) không khớp với số lượng câu hỏi (${questions.length}).`;
    }

    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), q);
    });

    const hasQuestionId = answers.some((a) => a.questionId);
    const allHaveQuestionId = answers.every((a) => a.questionId);

    if (hasQuestionId && !allHaveQuestionId) {
      return "Nếu sử dụng questionId, tất cả answers phải có questionId.";
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      if (!answer || typeof answer !== "object") {
        return `Câu trả lời thứ ${i + 1} không hợp lệ.`;
      }

      if (hasQuestionId) {
        if (!answer.questionId) {
          return `Câu trả lời thứ ${i + 1} thiếu questionId.`;
        }
        console.log("ok", answer)
        const questionIdStr = answer.questionId.toString();
        if (!questionMap.has(questionIdStr)) {
          return `Câu trả lời thứ ${i + 1} có questionId không hợp lệ: ${questionIdStr}.`;
        }
      }

      let question = null;
      if (hasQuestionId) {
        question = questionMap.get(answer.questionId.toString());
      } else {
        question = questions[i];
      }

      if (!question) {
        return `Không tìm thấy câu hỏi cho câu trả lời thứ ${i + 1}.`;
      }

      // Matching questions can accept both string and array formats
      if (question.type === "matching") {
        if (
          answer.selectedAnswer === undefined ||
          answer.selectedAnswer === null ||
          (typeof answer.selectedAnswer !== "string" &&
            !Array.isArray(answer.selectedAnswer))
        ) {
          return `Câu trả lời thứ ${i + 1} (matching) phải có selectedAnswer là string hoặc mảng.`;
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

      if (
        answer.timeSpent !== undefined &&
        (typeof answer.timeSpent !== "number" || answer.timeSpent < 0)
      ) {
        return `timeSpent của câu trả lời thứ ${i + 1} phải là số >= 0.`;
      }
    }

    return null;
  }

  _calculateTotalTimeSpent(gradedAnswers) {
    return gradedAnswers.reduce((total, answer) => {
      return total + (answer.timeSpent || 0);
    }, 0);
  }

  async _updateUserProgressAfterQuizPass(userId, blockId, quizId) {
    try {
      const block = await BlockRepository.getBlockById(toObjectId(blockId));
      if (!block) {
        console.warn(
          `[QuizAttemptForBlockService] Block ${blockId} not found when updating progress`
        );
        return;
      }

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

      let progress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      if (!progress) {
        progress = await UserProgressRepository.findOrCreate(
          userId,
          learningPathId
        );
      }

      await UserProgressRepository.updateBlockProgress(
        userId,
        learningPathId,
        lessonId,
        blockId,
        0,
        0
      );

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

      let lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
      if (!lessonProgress) {
        console.warn(
          `[QuizAttemptForBlockService] LessonProgress not found for lesson ${lessonId}`
        );
        return;
      }

      const blockProgress = lessonProgress.blockProgress.find(
        (bp) => bp.blockId.toString() === blockId.toString()
      );

      if (!blockProgress) {
        console.warn(
          `[QuizAttemptForBlockService] BlockProgress not found for block ${blockId} after creation`
        );
        return;
      }

      blockProgress.isCompleted = true;
      blockProgress.completedAt = new Date();
      blockProgress.lastUpdatedAt = new Date();

      await progress.save();

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
      console.error(
        `[QuizAttemptForBlockService] Error updating user progress after quiz pass for user ${userId}, block ${blockId}:`,
        error
      );
    }
  }

  async _markBlockCompletedWhenNoExercise(userId, blockId, lessonId) {
    try {
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

      let progress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      if (!progress) {
        progress = await UserProgressRepository.findOrCreate(
          userId,
          learningPathId
        );
      }

      await UserProgressRepository.updateBlockProgress(
        userId,
        learningPathId,
        lessonId,
        blockId,
        0,
        0
      );

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

      let lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
      if (!lessonProgress) {
        console.warn(
          `[QuizAttemptForBlockService] LessonProgress not found for lesson ${lessonId}`
        );
        return;
      }

      const blockProgress = lessonProgress.blockProgress.find(
        (bp) => bp.blockId.toString() === blockId.toString()
      );

      if (!blockProgress) {
        console.warn(
          `[QuizAttemptForBlockService] BlockProgress not found for block ${blockId} after creation`
        );
        return;
      }

      blockProgress.isCompleted = true;
      blockProgress.completedAt = new Date();
      blockProgress.lastUpdatedAt = new Date();

      await progress.save();

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
      console.error(
        `[QuizAttemptForBlockService] Error marking block completed when no exercise for user ${userId}, block ${blockId}:`,
        error
      );
    }
  }

  _sanitizeQuizForUser(quiz) {
    if (!quiz) {
      return quiz;
    }

    const quizObj = quiz.toObject ? quiz.toObject() : quiz;

    const sanitizedQuiz = JSON.parse(JSON.stringify(quizObj));

    if (sanitizedQuiz.questions && Array.isArray(sanitizedQuiz.questions)) {
      sanitizedQuiz.questions = sanitizedQuiz.questions.map((question) => {
        if (
          (question.type === "multiple_choice" ||
            question.type === "fill_blank") &&
          question.options &&
          Array.isArray(question.options)
        ) {
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