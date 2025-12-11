"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const HTTP_STATUS = require("../constants/httpStatus");
const { toObjectId } = require("../helpers/idHelper");
const ExamRepository = require("../repositories/exam.repo");
const QuizRepository = require("../repositories/quiz.repo");
const quizAttemptService = require("./quizAttempt.service");
const LearningPathRepository = require("../repositories/learningPath.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");
const AppError = require("../utils/appError");
const QuizAttemptRepository = require("../repositories/quizAttempt.repo");
const GrammarNlpService = require("./grammarNlp.service");
const ExamAttempt = require("../models/ExamAttempt");
const quizAttemptRepository = require("../repositories/quizAttempt.repo");
class ExamService {
  async getAllExams(req) {
    const { page = 1, limit = 20, status, search } = req.query || {};

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    } else {
      filter.status = { $ne: "deleted" };
    }
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [exams, total] = await Promise.all([
      ExamRepository.findExams(filter, {
        skip,
        limit: parseInt(limit),
        sort: { createdAt: -1 },
      }),
      ExamRepository.countExams(filter),
    ]);

    return ResponseBuilder.success("Lấy danh sách exams thành công.", {
      exams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  }

  /**
   * Lấy exam theo ID (cho admin edit)
   * Populate sections với quiz details
   */
  async getExamById(req) {
    const { examId } = req.params;

    const exam = await ExamRepository.findExamById(toObjectId(examId), {
      populateSections: true,
    });

    if (!exam) {
      return ResponseBuilder.notFoundError("Exam không tồn tại.");
    }

    return ResponseBuilder.success("Lấy exam thành công.", exam);
  }

  /**
   * Admin tạo Exam
   * Body:
   * {
   *   "title": "TOEIC Test A",
   *   "description": "...",
   *   "totalTimeLimit": 3600,
   *   "sections": [
   *     { "title": "Listening", "skill": "listening", "quiz": "quizId1", "order": 1, "timeLimit": 1200 },
   *     { "title": "Reading",  "skill": "reading",   "quiz": "quizId2", "order": 2 }
   *   ]
   * }
   */
  async createExam(req) {
    const { title, description, maxScore, totalTimeLimit, sections } =
      req.body || {};

    if (
      !title ||
      !maxScore ||
      !Array.isArray(sections) ||
      sections.length === 0
    ) {
      return ResponseBuilder.badRequest(
        "Tiêu đề exam, điểm số tối đa và danh sách sections là bắt buộc."
      );
    }

    if (maxScore <= 0) {
      return ResponseBuilder.badRequest("Điểm số tối đa phải lớn hơn 0.");
    }

    // Lấy danh sách quizId từ body
    const quizIds = sections.map((sec) => sec.quiz).filter(Boolean);

    if (quizIds.length !== sections.length) {
      return ResponseBuilder.badRequest("Mỗi section phải có quizId hợp lệ.");
    }

    // Kiểm tra quiz tồn tại thông qua repository
    const quizzes = await ExamRepository.findQuizzesByIds(quizIds);
    const existingQuizIdSet = new Set(quizzes.map((q) => q._id.toString()));

    // Kiểm tra từng section: quiz nào không tồn tại sẽ được liệt kê rõ ràng
    const invalidSections = sections.filter(
      (sec) => !existingQuizIdSet.has(String(sec.quiz))
    );

    if (invalidSections.length > 0) {
      return ResponseBuilder.badRequest(
        "Một hoặc nhiều quiz trong sections không tồn tại. Vui lòng kiểm tra lại.",
        invalidSections.map((sec) => ({
          title: sec.title,
          quiz: sec.quiz,
        }))
      );
    }

    // Chuẩn hóa sections đưa vào Exam
    const normalizedSections = sections
      .map((sec, index) => ({
        title: sec.title,
        skill: sec.skill,
        order: sec.order ?? index + 1,
        quiz: toObjectId(sec.quiz),
        timeLimit: sec.timeLimit ?? null,
        maxScore: sec.maxScore,
      }))
      .sort((a, b) => a.order - b.order);

    const examPayload = {
      title,
      description: description || null,
      maxScore,
      totalTimeLimit: totalTimeLimit ?? null,
      sections: normalizedSections,
      updatedBy: req.user?.id || null,
      updatedAt: new Date(),
    };

    const exam = await ExamRepository.createExam(examPayload);

    return ResponseBuilder.success(
      "Tạo exam thành công.",
      exam,
      HTTP_STATUS.CREATED
    );
  }

  /**
   * Cập nhật exam (admin)
   * Body: Có thể cập nhật title, description, totalTimeLimit, sections, status
   */
  async updateExam(req) {
    const { examId } = req.params;
    const updateData = req.body || {};

    // Kiểm tra exam tồn tại
    const exam = await ExamRepository.findExamById(toObjectId(examId));
    if (!exam) {
      return ResponseBuilder.notFoundError("Exam không tồn tại.");
    }

    // Nếu cập nhật sections, validate quizzes
    if (updateData.sections && Array.isArray(updateData.sections)) {
      const quizIds = updateData.sections
        .map((sec) => sec.quiz)
        .filter(Boolean);

      if (quizIds.length > 0) {
        const quizzes = await ExamRepository.findQuizzesByIds(quizIds);
        const existingQuizIdSet = new Set(quizzes.map((q) => q._id.toString()));

        const invalidSections = updateData.sections.filter(
          (sec) => sec.quiz && !existingQuizIdSet.has(String(sec.quiz))
        );

        if (invalidSections.length > 0) {
          return ResponseBuilder.badRequest(
            "Một hoặc nhiều quiz không tồn tại.",
            invalidSections.map((sec) => ({
              title: sec.title,
              quiz: sec.quiz,
            }))
          );
        }

        // Normalize sections
        updateData.sections = updateData.sections
          .map((sec, index) => ({
            title: sec.title,
            skill: sec.skill,
            order: sec.order ?? index + 1,
            quiz: toObjectId(sec.quiz),
            timeLimit: sec.timeLimit ?? null,
          }))
          .sort((a, b) => a.order - b.order);
      }
    }

    // Add metadata
    updateData.updatedBy = req.user?.id || null;
    updateData.updatedAt = new Date();

    const updatedExam = await ExamRepository.updateExam(examId, updateData);

    return ResponseBuilder.success("Cập nhật exam thành công.", updatedExam);
  }

  /**
   * Xóa exam (admin) - Soft delete
   * Cập nhật status = 'deleted' thay vì xóa hẳn
   */
  async deleteExam(req) {
    const { examId } = req.params;

    const exam = await ExamRepository.findExamById(toObjectId(examId));
    if (!exam) {
      return ResponseBuilder.notFoundError("Exam không tồn tại.");
    }

    // Kiểm tra xem có exam attempt nào đang in_progress không
    const activeAttempts = await ExamRepository.countActiveAttempts(examId);
    if (activeAttempts > 0) {
      return ResponseBuilder.badRequest(
        `Không thể xóa exam vì có ${activeAttempts} người đang làm bài.`
      );
    }

    // Soft delete - cập nhật status
    await ExamRepository.updateExam(examId, {
      status: "deleted",
      updatedBy: req.user?.id || null,
      updatedAt: new Date(),
    });

    return ResponseBuilder.success("Xóa exam thành công.", { examId });
  }

  // ===== USER METHODS =====

  /**
   * Kiểm tra user đã hoàn thành level chứa exam này chưa
   * @private
   * @param {string} userId - ID của user
   * @param {object} exam - Exam object
   * @returns {Promise<object|null>} Response error nếu chưa hoàn thành, null nếu OK
   */
  /**
   * Kiểm tra user đã hoàn thành tất cả lesson trong level chứa exam này chưa
   * Logic:
   * 1. Tìm LearningPath chứa exam này (thông qua finalQuiz của level)
   * 2. Tìm level chứa exam này (level có finalQuiz = exam._id)
   * 3. Lấy danh sách tất cả lesson trong level đó (level.lessons)
   * 4. Kiểm tra từng lesson đã completed chưa (dựa trên lessonProgress.isCompleted)
   * 5. Nếu có lesson chưa completed → throw error
   *
   * @private
   * @param {string} userId - ID của user
   * @param {object} exam - Exam object
   * @throws {AppError} Nếu chưa hoàn thành tất cả lesson trong level
   */
  async _validateLevelCompletion(userId, exam) {
    // Bước 1: Tìm LearningPath chứa exam này
    const learningPath = await LearningPathRepository.findByFinalExam(exam._id);
    if (!learningPath) {
      console.log(
        `[Level Validation] LearningPath not found for exam: ${exam._id}`
      );
      throw new AppError("Exam không thuộc level nào.", HTTP_STATUS.FORBIDDEN);
    }

    // Bước 2: Tìm level chứa exam này (level có finalQuiz = exam._id)
    const level = learningPath.levels?.find(
      (lvl) => lvl.finalQuiz?.toString() === exam._id.toString()
    );

    if (!level) {
      console.log(
        `[Level Validation] Level not found for exam: ${exam._id} in learningPath: ${learningPath._id}`
      );
      throw new AppError(
        "Không tìm thấy level chứa exam này.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Bước 3: Lấy danh sách tất cả lesson trong level này
    // level.lessons là array: [{ lesson: ObjectId, order: Number }, ...]
    const requiredLessonIds =
      level?.lessons?.map((l) => l.lesson?.toString()).filter(Boolean) || [];

    if (requiredLessonIds.length === 0) {
      console.log(
        `[Level Validation] Level ${level.order} (${level.title}) không có lesson nào`
      );
      throw new AppError("Level không có lesson nào.", HTTP_STATUS.FORBIDDEN);
    }

    console.log(
      `[Level Validation] Level ${level.order} (${level.title}) có ${requiredLessonIds.length} lesson cần hoàn thành:`,
      requiredLessonIds
    );
    console.log("learningPath", learningPath);
    console.log("userId", userId);

    // Bước 4: Lấy progress của user trong learningPath này
    const progress = await UserProgressRepository.findByUserAndPath(
      userId,
      learningPath._id
    );
    console.log("progress", progress);
    if (!progress) {
      console.log(
        `[Level Validation] User ${userId} chưa có progress trong learningPath ${learningPath._id}`
      );
      throw new AppError(
        "Bạn chưa bắt đầu học lộ trình này. Vui lòng bắt đầu học các bài học trong level trước.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Bước 5: Tạo map để kiểm tra lesson đã completed
    // Sử dụng lessonProgress với isCompleted = true (đảm bảo tất cả block đã completed)
    const completedLessonMap = new Map();
    if (progress.lessonProgress && Array.isArray(progress.lessonProgress)) {
      progress.lessonProgress.forEach((lp) => {
        if (lp.isCompleted) {
          completedLessonMap.set(lp.lessonId.toString(), true);
        }
      });
    }

    console.log(
      `[Level Validation] User ${userId} đã completed ${completedLessonMap.size} lesson(s)`
    );

    // Bước 6: Kiểm tra từng lesson trong level có completed chưa
    const incompleteLessons = requiredLessonIds.filter(
      (lessonId) => !completedLessonMap.has(lessonId)
    );

    console.log("incompleteLessons", incompleteLessons);

    if (incompleteLessons.length > 0) {
      console.log(
        `[Level Validation] User ${userId} chưa hoàn thành ${incompleteLessons.length}/${requiredLessonIds.length} lesson trong level ${level.order} (${level.title})`
      );
      console.log(
        `[Level Validation] Các lesson chưa hoàn thành:`,
        incompleteLessons
      );
      throw new AppError(
        `Bạn cần hoàn thành tất cả ${requiredLessonIds.length} bài học trong level "${level.title}" (${incompleteLessons.length} bài chưa hoàn thành) trước khi bắt đầu exam này.`,
        HTTP_STATUS.FORBIDDEN
      );
    }

    console.log(
      `[Level Validation] ✓ User ${userId} đã hoàn thành tất cả ${requiredLessonIds.length} lesson trong level ${level.order} (${level.title})`
    );
  }

  /**
   * Tạo QuizAttempt cho từng section của exam
   * @private
   * @param {string} userId - ID của user
   * @param {Array} sections - Danh sách sections của exam
   * @returns {Promise<Array>} Danh sách QuizAttempt đã tạo
   */
  async _createQuizAttemptsForExam(userId, sections) {
    const quizAttemptPayloads = (sections || []).map((section) => ({
      user: userId,
      quiz: section.quiz,
      answers: [],
      score: 0,
      percentage: 0,
      timeSpent: 0,
      status: "in_progress",
      startedAt: new Date(),
      completedAt: null,
    }));

    return await quizAttemptService.createQuizAttemptRange(quizAttemptPayloads);
  }

  /**
   * Build payload cho ExamAttempt từ quizAttempts đã tạo
   * @private
   * @param {string} userId - ID của user
   * @param {object} exam - Exam object
   * @param {Array} quizAttempts - Danh sách QuizAttempt đã tạo
   * @returns {object} Payload cho ExamAttempt
   */
  _buildExamAttemptPayload(userId, exam, quizAttempts) {
    const sectionsForExamAttempt = (exam.sections || []).map(
      (section, index) => ({
        sectionId: section._id,
        quizAttempt: quizAttempts[index]?._id,
        status: "in_progress",
        timeSpent: 0,
        score: 0,
        percentage: 0,
      })
    );

    return {
      exam: exam._id,
      user: userId,
      sections: sectionsForExamAttempt,
      status: "in_progress",
      totalScore: 0,
      totalPercentage: 0,
      totalTimeSpent: 0,
      startedAt: new Date(),
      completedAt: null,
    };
  }

  /**
   * Format exam attempt response với đầy đủ thông tin sections và questions
   * @private
   * @param {object} examAttempt - ExamAttempt object (có thể là lean hoặc mongoose doc)
   * @param {object} exam - Exam object
   * @returns {Promise<object>} Formatted response
   */
  async _formatExamAttemptResponse(examAttempt, exam) {
    const sections = [];

    // Lặp qua từng section trong examAttempt
    for (const sectionAttempt of examAttempt.sections || []) {
      // Lấy quizAttempt với quiz đã populate
      const quizAttempt = await quizAttemptRepository.findById(
        sectionAttempt.quizAttempt
      );

      if (!quizAttempt || !quizAttempt.quiz) {
        continue; // Skip nếu không tìm thấy quizAttempt hoặc quiz
      }

      // Lấy questions từ quiz (không bao gồm correctAnswer, explanation, isCorrect)
      const questions = (quizAttempt.quiz.questions || []).map((question) => {
        // Format options: loại bỏ isCorrect
        const options = (question.options || []).map((option) => ({
          text: option.text,
        }));

        return {
          _id: question._id,
          type: question.type,
          questionText: question.questionText,
          options: options,
          points: question.points || 1,
          tags: question.tags || [],
          thumbnail: question.thumbnail || null,
          audio: question.audio || null,
          sourceType: question.sourceType || null,
          sourceId: question.sourceId || null,
        };
      });

      sections.push({
        sectionId: sectionAttempt.sectionId,
        skill: quizAttempt.quiz.skill, // Lấy từ quiz
        status: sectionAttempt.status,
        score: sectionAttempt.score || 0,
        percentage: sectionAttempt.percentage || 0,
        timeSpent: sectionAttempt.timeSpent || 0,
        questions: questions,
      });
    }

    console.log("examAttempt", examAttempt);

    return {
      exam: {
        _id: examAttempt._id,
        attemptId: examAttempt._id,
        timeSpent: examAttempt.totalTimeSpent || 0,
        startAt: examAttempt.startedAt,
        status: examAttempt.status,
        totalScore: examAttempt.totalScore || 0,
        totalPercentage: examAttempt.totalPercentage || 0,
        totalTimeLimit: exam.totalTimeLimit ?? null, // Include totalTimeLimit from exam
      },
      sections: sections,
    };
  }

  async startExam(req) {
    const { examId } = req.params;
    const userId = req.user?._id;
    const exam = await ExamRepository.findExamById(toObjectId(examId));
    if (!exam) {
      return ResponseBuilder.notFoundError("Exam không tồn tại.");
    }

    // Kiểm tra xem đã có exam attempt nào (cả in_progress và completed) chưa
    const existingAttempt = await ExamRepository.findExamAttemptByUserAndExam(
      userId,
      exam._id
    );

    if (existingAttempt) {
      // Đã có attempt, format và return response
      const formattedResponse = await this._formatExamAttemptResponse(
        existingAttempt,
        exam
      );

      const message =
        existingAttempt.status === "in_progress"
          ? "Bạn đang có bài thi đang làm dở."
          : "Bạn đã làm bài thi này trước đó.";

      return ResponseBuilder.success(message, formattedResponse);
    }

    // Chưa có attempt, tạo mới
    // Kiểm tra user đã hoàn thành level chứa exam này chưa
    await this._validateLevelCompletion(userId, exam);

    // Bước 1: Tạo QuizAttempt cho từng section
    const quizAttempts = await this._createQuizAttemptsForExam(
      userId,
      exam.sections
    );

    // Bước 2: Tạo ExamAttempt tổng hợp
    const examAttemptPayload = this._buildExamAttemptPayload(
      userId,
      exam,
      quizAttempts
    );

    console.log("exam", exam);

    const examAttempt = await ExamRepository.createExamAttempt({
      ...examAttemptPayload,
      totalTimeSpent: exam.totalTimeLimit,
    });

    // Convert mongoose document sang plain object nếu cần
    const examAttemptObj = examAttempt.toObject
      ? examAttempt.toObject()
      : examAttempt;

    // Format response cho attempt mới tạo
    const formattedResponse = await this._formatExamAttemptResponse(
      examAttemptObj,
      exam
    );

    return ResponseBuilder.success(
      "Bắt đầu làm exam thành công.",
      formattedResponse,
      HTTP_STATUS.CREATED
    );
  }

  async getSectionByExam(examAttemptId) {}

  /**
   * Lấy câu hỏi của section trong exam attempt
   * GET /exam-attempts/:attemptId/section/:sectionId
   */
  async getSectionQuestions(req) {
    const { attemptId, sectionId } = req.params;
    const userId = req.user?._id;

    const attempt = await ExamRepository.findExamAttemptById(
      toObjectId(attemptId)
    );
    if (!attempt) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam attempt.");
    }

    if (attempt.user.toString() !== userId.toString()) {
      return ResponseBuilder.forbiddenError(
        "Bạn không có quyền truy cập attempt này."
      );
    }

    const sectionAttempt =
      attempt.sections?.find(
        (s) => s.sectionId?.toString() === sectionId?.toString()
      ) || null;
    if (!sectionAttempt) {
      return ResponseBuilder.notFoundError(
        "Không tìm thấy section trong attempt."
      );
    }

    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam.");
    }

    const sectionMeta =
      exam.sections?.find((s) => s._id?.toString() === sectionId?.toString()) ||
      null;
    if (!sectionMeta) {
      return ResponseBuilder.notFoundError(
        "Không tìm thấy section trong exam."
      );
    }
    const quizAttempt = await quizAttemptRepository.findById(
      sectionAttempt.quizAttempt
    );
    console.log("quizAttempt", quizAttempt);
    if (!quizAttempt || !quizAttempt.quiz) {
      return ResponseBuilder.notFoundError("Không tìm thấy quiz.");
    }

    const timeLimit = sectionMeta.timeLimit ?? null;
    const timeSpent = sectionAttempt.timeSpent ?? 0;
    const remainingTime =
      timeLimit != null ? Math.max(timeLimit - timeSpent, 0) : null;

    return ResponseBuilder.success("Lấy câu hỏi section thành công.", {
      sectionId: sectionMeta._id,
      skill: sectionMeta.skill,
      timeLimit,
      timeSpent,
      remainingTime,
      questions: quizAttempt.quiz.questions || [],
    });
  }

  /**
   * Submit một section trong exam attempt (chỉ lưu answers, chưa chấm điểm)
   * POST /exam-attempts/:attemptId/section/:sectionId/submit
   * Body: { answers: [...], timeSpent: number }
   *
   * Lưu ý: Chỉ lưu lại câu trả lời của user, chưa chấm điểm.
   * Chấm điểm sẽ được thực hiện khi complete exam.
   */
  async submitSection(req) {
    const { attemptId, sectionId } = req.params;
    const { answers, timeSpent } = req.body || {};
    const userId = req.user?._id;

    // Validate input
    if (!Array.isArray(answers)) {
      return ResponseBuilder.badRequest("answers phải là một mảng.");
    }

    // Lấy exam attempt
    const attempt = await ExamRepository.findExamAttemptById(
      toObjectId(attemptId)
    );
    if (!attempt) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam attempt.");
    }

    // Kiểm tra quyền truy cập
    if (attempt.user.toString() !== userId.toString()) {
      return ResponseBuilder.forbiddenError(
        "Bạn không có quyền truy cập attempt này."
      );
    }

    // Kiểm tra exam attempt chưa completed
    if (attempt.status === "completed") {
      return ResponseBuilder.badRequest("Exam đã được hoàn thành.");
    }

    // Tìm section attempt
    const sectionAttempt = attempt.sections?.find(
      (s) => s.sectionId?.toString() === sectionId?.toString()
    );
    if (!sectionAttempt) {
      return ResponseBuilder.notFoundError(
        "Không tìm thấy section trong attempt."
      );
    }

    // Kiểm tra section chưa submitted
    if (sectionAttempt.status === "completed") {
      return ResponseBuilder.badRequest("Section này đã được nộp trước đó.");
    }

    // Lấy quiz attempt
    const quizAttempt = await QuizAttemptRepository.findById(
      sectionAttempt.quizAttempt
    );
    console.log("ok");

    if (!quizAttempt) {
      return ResponseBuilder.notFoundError("Không tìm thấy quiz attempt.");
    }
    // Lưu raw answers (chưa chấm điểm) vào quiz attempt
    // Format: [{ questionId, selectedAnswer, timeSpent }]
    const rawAnswers = answers.map((answer) => {
      const answerObj = {
        questionId: answer.questionId || answer._id,
        selectedAnswer: answer.selectedAnswer || "",
        timeSpent: answer.timeSpent || 0,
      };

      // Chỉ thêm writingAnswer nếu có giá trị (không set null)
      if (
        answer.writingAnswer &&
        (answer.writingAnswer.text ||
          answer.writingAnswer.wordCount !== undefined)
      ) {
        answerObj.writingAnswer = answer.writingAnswer;
      }

      // Chỉ thêm speakingAnswer nếu có giá trị (không set null)
      if (
        answer.speakingAnswer &&
        (answer.speakingAnswer.audioUrl ||
          answer.speakingAnswer.duration !== undefined)
      ) {
        answerObj.speakingAnswer = answer.speakingAnswer;
      }

      return answerObj;
    });

    // Cập nhật quiz attempt - chỉ lưu answers và timeSpent, chưa chấm điểm
    quizAttempt.answers = rawAnswers;
    quizAttempt.timeSpent = timeSpent || 0;
    // Giữ nguyên status = "in_progress", chưa set completed
    await quizAttempt.save();

    // Cập nhật section attempt trong exam attempt - chỉ đánh dấu là đã submit
    const sectionIndex = attempt.sections.findIndex(
      (s) => s.sectionId?.toString() === sectionId?.toString()
    );
    if (sectionIndex !== -1) {
      attempt.sections[sectionIndex].status = "completed"; // Đánh dấu đã submit
      attempt.sections[sectionIndex].timeSpent = timeSpent || 0;
      // Chưa set score và percentage, sẽ tính sau khi complete exam
    }

    await attempt.save();

    // Kiểm tra còn section nào chưa submit
    const remainingSections = attempt.sections.filter(
      (s) => s.status === "in_progress"
    );

    return ResponseBuilder.success("Nộp section thành công.", {
      sectionId: sectionAttempt.sectionId,
      timeSpent: timeSpent || 0,
      hasMoreSections: remainingSections.length > 0,
      remainingSectionsCount: remainingSections.length,
      totalSections: attempt.sections.length,
      completedSectionsCount: attempt.sections.filter(
        (s) => s.status === "completed"
      ).length,
    });
  }

  /**
   * Complete exam khi tất cả section đã completed
   * POST /exam-attempts/:attemptId/submit
   *
   * Logic:
   * 1. Kiểm tra tất cả sections đã submit chưa
   * 2. Chấm điểm tất cả sections
   * 3. Tính tổng điểm
   * 4. Cập nhật exam attempt
   */
  async completeExam(req) {
    const { attemptId } = req.params;
    const { answers, timeSpent, autoSubmit } = req.body || {};
    const userId = req.user?._id;

    // Lấy exam attempt
    const attempt = await ExamRepository.findExamAttemptById(
      toObjectId(attemptId)
    );
    if (!attempt) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam attempt.");
    }

    // Kiểm tra quyền truy cập
    if (attempt.user.toString() !== userId.toString()) {
      return ResponseBuilder.forbiddenError(
        "Bạn không có quyền truy cập attempt này."
      );
    }

    // Kiểm tra exam đã completed chưa
    // Nếu đã completed nhưng KHÔNG có answers mới → trả về kết quả cũ
    if (attempt.status === "completed" && (!answers || answers.length === 0)) {
      return ResponseBuilder.success(
        "Exam đã được hoàn thành trước đó.",
        await this._buildExamResult(attempt)
      );
    }

    // Nếu đã completed nhưng CÓ answers mới → chấm lại (regrade)
    if (attempt.status === "completed" && answers && answers.length > 0) {
      console.log(
        `[ExamService] Attempt ${attemptId} đã completed nhưng có answers mới được gửi. Tiếp tục chấm điểm lại...`
      );
      // Tiếp tục logic chấm điểm bên dưới
    }

    // Validate answers
    if (!Array.isArray(answers)) {
      return ResponseBuilder.badRequest("answers phải là một mảng.");
    }

    // Lấy exam để lấy thông tin sections
    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam.");
    }

    // Group answers by section
    const answersBySection = new Map();
    for (const answer of answers) {
      const questionId = answer.questionId?.toString();
      if (!questionId) continue;

      // Tìm section chứa question này
      for (const sectionMeta of exam.sections || []) {
        const quiz = await QuizRepository.getQuizById(sectionMeta.quiz);
        if (!quiz) continue;

        const question = quiz.questions?.find(
          (q) => q._id?.toString() === questionId
        );
        if (question) {
          const sectionId = sectionMeta._id?.toString();
          if (!answersBySection.has(sectionId)) {
            answersBySection.set(sectionId, []);
          }
          answersBySection.get(sectionId).push(answer);
          break;
        }
      }
    }

    // Kiểm tra tất cả section đã submit chưa (chỉ khi chưa completed và KHÔNG có answers trong request)
    // Nếu có answers trong request, có nghĩa là user đang gửi tất cả answers để complete exam
    // → Không cần kiểm tra status của sections nữa
    if (attempt.status !== "completed" && (!answers || answers.length === 0)) {
      const incompleteSections = attempt.sections?.filter(
        (s) => s.status !== "completed"
      );
      if (incompleteSections && incompleteSections.length > 0) {
        return ResponseBuilder.badRequest(
          `Bạn cần hoàn thành tất cả ${incompleteSections.length} section còn lại trước khi nộp exam.`
        );
      }
    }

    // Nếu có answers trong request, kiểm tra xem có đủ answers cho tất cả sections không
    if (answers && answers.length > 0) {
      const sectionsWithAnswers = answersBySection.size;
      const totalSections = (exam.sections || []).length;
      
      // Log để debug
      console.log(
        `[ExamService] completeExam: ${sectionsWithAnswers}/${totalSections} sections có answers trong request`
      );
      
      // Nếu thiếu answers cho một số sections, có thể lấy từ QuizAttempt đã lưu
      // (từ submitSection trước đó nếu có)
    }

    // Chấm điểm tất cả sections
    const gradedSections = [];
    let totalScore = 0;
    let totalPercentage = 0;
    let totalTimeSpent = 0;
    const totalTimeSpentFromRequest = timeSpent || 0;

    for (const sectionAttempt of attempt.sections || []) {
      // Lấy quiz attempt (lean để đọc data)
      const quizAttempt = await QuizAttemptRepository.findById(
        sectionAttempt.quizAttempt
      );
      if (!quizAttempt) {
        console.error(`QuizAttempt not found: ${sectionAttempt.quizAttempt}`);
        continue;
      }

      // Lấy quiz để chấm điểm
      const quiz = await QuizRepository.getQuizById(quizAttempt.quiz);
      if (!quiz) {
        console.error(`Quiz not found: ${quizAttempt.quiz}`);
        continue;
      }

      // Lấy answers cho section này từ request
      const sectionId = sectionAttempt.sectionId?.toString();
      let sectionAnswers = answersBySection.get(sectionId) || [];

      // Nếu section này không có answers trong request, lấy từ QuizAttempt đã lưu
      // (từ submitSection trước đó nếu có)
      if (sectionAnswers.length === 0 && quizAttempt.answers && quizAttempt.answers.length > 0) {
        // Convert answers từ QuizAttempt sang format giống request body
        sectionAnswers = quizAttempt.answers.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer || "",
          timeSpent: a.timeSpent || 0,
          writingAnswer: a.writingAnswer || null,
          speakingAnswer: a.speakingAnswer || null,
        }));
        console.log(
          `[ExamService] Section ${sectionId} không có answers trong request, ` +
            `đã lấy ${sectionAnswers.length} answers từ QuizAttempt đã lưu.`
        );
      }

      // Lưu answers vào quiz attempt trước khi chấm
      const rawAnswers = sectionAnswers.map((answer) => {
        const answerObj = {
          questionId: answer.questionId || answer._id,
          selectedAnswer: answer.selectedAnswer || "",
          timeSpent: answer.timeSpent || 0,
        };

        if (
          answer.writingAnswer &&
          (answer.writingAnswer.text || answer.writingAnswer.wordCount !== undefined)
        ) {
          answerObj.writingAnswer = answer.writingAnswer;
        }

        if (
          answer.speakingAnswer &&
          (answer.speakingAnswer.audioUrl || answer.speakingAnswer.duration !== undefined)
        ) {
          answerObj.speakingAnswer = answer.speakingAnswer;
        }

        return answerObj;
      });

      // Update quiz attempt using findByIdAndUpdate (vì findById trả về lean object)
      await QuizAttemptRepository.updateById(sectionAttempt.quizAttempt, {
        answers: rawAnswers,
        timeSpent: sectionAttempt.timeSpent || 0,
      });

      // Chấm điểm với detailed information
      const gradedAnswers = await this._gradeAnswers(
        quiz.questions,
        sectionAnswers,
        true // includeCorrectAnswers = true
      );

      // Tính điểm
      const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
      const totalCount = quiz.questions.length;
      const earnedPoints = gradedAnswers.reduce(
        (sum, a) => sum + (a.pointsEarned || 0),
        0
      );
      const sectionScore = earnedPoints;

      // Tính percentage: với writing, dùng score từ API; với các loại khác, dùng tỷ lệ đúng/sai
      let sectionPercentage = 0;
      const writingQuestions = quiz.questions.filter(
        (q) => q.type === "writing"
      );
      if (writingQuestions.length > 0) {
        // Nếu có writing questions, tính percentage dựa trên điểm trung bình từ API
        const writingAnswers = gradedAnswers.filter((a) =>
          writingQuestions.some(
            (q) => q._id.toString() === a.questionId.toString()
          )
        );
        if (writingAnswers.length > 0) {
          const avgWritingScore =
            writingAnswers.reduce((sum, a) => {
              const apiScore = a.writingGrading?.grading?.score || 0;
              return sum + apiScore;
            }, 0) / writingAnswers.length;

          // Tính percentage cho toàn bộ section (kết hợp writing và các câu khác)
          const nonWritingCount = totalCount - writingAnswers.length;
          const nonWritingCorrect =
            correctCount - writingAnswers.filter((a) => a.isCorrect).length;
          const nonWritingPercentage =
            nonWritingCount > 0
              ? Math.round((nonWritingCorrect / nonWritingCount) * 100)
              : 0;

          sectionPercentage = Math.round(
            (avgWritingScore * writingAnswers.length +
              nonWritingPercentage * nonWritingCount) /
              totalCount
          );
        } else {
          sectionPercentage =
            totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        }
      } else {
        sectionPercentage =
          totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      }

      // Cập nhật quiz attempt với kết quả đã chấm
      await QuizAttemptRepository.updateById(sectionAttempt.quizAttempt, {
        answers: gradedAnswers, // Thay raw answers bằng graded answers
        score: sectionScore,
        percentage: sectionPercentage,
        status: "completed",
        completedAt: new Date(),
      });

      // Cập nhật section attempt trong exam attempt
      const sectionIndex = attempt.sections.findIndex(
        (s) => s.sectionId?.toString() === sectionAttempt.sectionId?.toString()
      );
      if (sectionIndex !== -1) {
        attempt.sections[sectionIndex].score = sectionScore;
        attempt.sections[sectionIndex].percentage = sectionPercentage;
      }

      // Tính tổng
      totalScore += sectionScore;
      totalPercentage += sectionPercentage;
      totalTimeSpent += sectionAttempt.timeSpent || 0;

      // Lấy skill từ exam.sections
      const sectionMeta = exam.sections?.find(
        (s) => s._id?.toString() === sectionAttempt.sectionId?.toString()
      );
      const sectionSkill = sectionMeta?.skill || "unknown";

      // Chỉ lấy thông tin writing grading nếu section có skill = "writing"
      // (Mặc dù quiz có thể có writing questions, nhưng chỉ hiển thị grading cho writing section)
      let writingGradings = undefined;
      if (sectionSkill === "writing") {
        writingGradings = gradedAnswers
          .filter((a) => a.writingGrading)
          .map((a) => ({
            questionId: a.questionId,
            grading: a.writingGrading.grading,
            grammarErrors: a.writingGrading.grammar_errors || [],
          }));

        // Chỉ thêm vào response nếu có writing gradings
        if (writingGradings.length === 0) {
          writingGradings = undefined;
        }
      }

      gradedSections.push({
        sectionId: sectionAttempt.sectionId,
        skill: sectionSkill,
        score: sectionScore,
        percentage: sectionPercentage,
        timeSpent: sectionAttempt.timeSpent || 0,
        correctAnswers: correctCount,
        totalQuestions: totalCount,
        writingGradings: writingGradings,
      });
    }

    // Tính tổng percentage (trung bình)
    const averagePercentage =
      attempt.sections && attempt.sections.length > 0
        ? Math.round(totalPercentage / attempt.sections.length)
        : 0;

    // Lưu attempt với scores đã được cập nhật
    await attempt.save();

    // Cập nhật exam attempt với tổng điểm
    const updatedAttempt = await ExamRepository.updateExamAttempt(attemptId, {
      status: "completed",
      totalScore,
      totalPercentage: averagePercentage,
      totalTimeSpent: totalTimeSpentFromRequest || totalTimeSpent,
      completedAt: new Date(),
    });

    return ResponseBuilder.success("Hoàn thành exam thành công.", {
      attemptId: updatedAttempt._id,
      totalScore,
      totalPercentage: averagePercentage,
      totalTimeSpent: totalTimeSpentFromRequest || totalTimeSpent,
      completedAt: updatedAttempt.completedAt,
      sections: gradedSections,
    });
  }

  /**
   * Lấy kết quả chi tiết của exam attempt
   * Bao gồm thông tin tổng quan và chi tiết từng câu hỏi (user answer, correct answer, grading)
   * @param {object} req - Request object với attemptId trong params
   * @returns {Promise<object>} Response với detailed exam result
   */
  async getExamAttemptResult(req) {
    const { attemptId } = req.params;
    const userId = req.user?._id;

    // Lấy exam attempt
    const attempt = await ExamRepository.findExamAttemptById(
      toObjectId(attemptId)
    );
    if (!attempt) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam attempt.");
    }

    // Kiểm tra quyền truy cập
    if (attempt.user.toString() !== userId.toString()) {
      return ResponseBuilder.forbiddenError(
        "Bạn không có quyền truy cập attempt này."
      );
    }

    // Lấy exam để lấy thông tin sections
    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam.");
    }

    // Load tất cả QuizAttempts cho các sections (batch query để tối ưu performance)
    const quizAttemptIds = (attempt.sections || [])
      .map((s) => s.quizAttempt)
      .filter(Boolean);

    const quizAttempts = await Promise.all(
      quizAttemptIds.map((id) => QuizAttemptRepository.findById(id))
    );

    // Tạo map để lookup QuizAttempt theo ID
    const quizAttemptMap = new Map();
    quizAttempts.forEach((qa) => {
      if (qa && qa._id) {
        quizAttemptMap.set(qa._id.toString(), qa);
      }
    });

    // Build sections result với detailed questions
    const sectionsResult = await Promise.all(
      (attempt.sections || []).map(async (sectionAttempt) => {
        const sectionMeta = exam.sections?.find(
          (s) => s._id?.toString() === sectionAttempt.sectionId?.toString()
        );
        const sectionSkill = sectionMeta?.skill || "unknown";

        // Lấy QuizAttempt cho section này
        const quizAttemptId = sectionAttempt.quizAttempt?.toString();
        const quizAttempt = quizAttemptMap.get(quizAttemptId);

        // Build base section result
        const sectionResult = {
          sectionId: sectionAttempt.sectionId,
          skill: sectionSkill,
          score: sectionAttempt.score || 0,
          percentage: sectionAttempt.percentage || 0,
          timeSpent: sectionAttempt.timeSpent || 0,
          status: sectionAttempt.status,
        };

        // Nếu có QuizAttempt và Quiz đã được populate, build detailed questions
        if (quizAttempt && quizAttempt.quiz && quizAttempt.quiz.questions) {
          const detailedQuestions = await this._buildDetailedQuestions(
            quizAttempt.quiz,
            quizAttempt
          );

          // Chỉ thêm detailedQuestions nếu có ít nhất 1 question
          if (detailedQuestions.length > 0) {
            sectionResult.detailedQuestions = detailedQuestions;
          }
        }

        return sectionResult;
      })
    );

    return ResponseBuilder.success("Lấy kết quả exam thành công.", {
      attemptId: attempt._id,
      status: attempt.status,
      totalScore: attempt.totalScore || 0,
      totalPercentage: attempt.totalPercentage || 0,
      totalTimeSpent: attempt.totalTimeSpent || 0,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      sections: sectionsResult,
    });
  }

  async _gradeWritingText(text) {
    try {
      const result = await GrammarNlpService.gradeWriting(text);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error grading writing text:", error);
      // Nếu API lỗi, trả về điểm 0 và thông báo lỗi
      return {
        success: false,
        error: error.message,
        data: {
          grading: {
            score: 0,
            level: "Unknown",
            overall_comment: `Lỗi khi chấm điểm: ${error.message}`,
            suggestions: [],
          },
          grammar_errors: [],
        },
      };
    }
  }

  /**
   * Helper method: Chấm điểm answers
   * Match answers theo questionId để đảm bảo chấm đúng kể cả khi thứ tự không đúng
   * Hỗ trợ writing type với API chấm điểm tự động
   * @private
   * @param {Array} questions - Danh sách câu hỏi
   * @param {Array} userAnswers - Danh sách câu trả lời của user
   * @returns {Promise<Array>} Danh sách answers đã được chấm điểm
   */
  async _gradeAnswers(questions, userAnswers) {
    // Tạo map để tìm answer theo questionId
    const answerMap = new Map();
    if (Array.isArray(userAnswers)) {
      userAnswers.forEach((answer) => {
        const questionId =
          answer.questionId?.toString() || answer._id?.toString();
        if (questionId) {
          answerMap.set(questionId, answer);
        }
      });
    }

    // Chấm điểm từng question
    const gradedAnswers = [];

    for (const question of questions) {
      const questionId = question._id?.toString();
      const userAnswer = answerMap.get(questionId) || null;

      let isCorrect = false;
      let pointsEarned = 0;
      let writingGrading = null; // Lưu kết quả chấm điểm writing

      if (question.type === "multiple_choice") {
        const correctOption = question.options?.find((opt) => opt.isCorrect);
        isCorrect = userAnswer?.selectedAnswer === correctOption?.text;
        if (isCorrect) {
          pointsEarned = question.points || 1;
        }
      } else if (question.type === "fill_blank") {
        isCorrect =
          userAnswer?.selectedAnswer?.trim().toLowerCase() ===
          question.correctAnswer?.trim().toLowerCase();
        if (isCorrect) {
          pointsEarned = question.points || 1;
        }
      } else if (question.type === "true_false") {
        isCorrect =
          userAnswer?.selectedAnswer?.toLowerCase() ===
          question.correctAnswer?.toLowerCase();
        if (isCorrect) {
          pointsEarned = question.points || 1;
        }
      } else if (question.type === "writing") {
        // Chấm điểm writing bằng API
        const writingText =
          userAnswer?.writingAnswer?.text || userAnswer?.selectedAnswer || "";

        if (writingText && writingText.trim().length > 0) {
          const gradingResult = await this._gradeWritingText(writingText);
          writingGrading = gradingResult.data;

          // Tính điểm dựa trên score từ API (0-100) và points của question
          const apiScore = gradingResult.data?.grading?.score || 0;
          // Chuyển đổi từ thang điểm 0-100 sang points của question
          // Ví dụ: question.points = 10, apiScore = 80 => pointsEarned = 8
          const maxPoints = question.points || 10;
          pointsEarned = Math.round((apiScore / 100) * maxPoints);

          // Coi là đúng nếu điểm >= 60% (có thể điều chỉnh)
          isCorrect = apiScore >= 60;
        } else {
          // Không có text để chấm
          pointsEarned = 0;
          isCorrect = false;
          writingGrading = {
            grading: {
              score: 0,
              level: "Unknown",
              overall_comment: "Không có nội dung để chấm điểm.",
              suggestions: ["Vui lòng viết câu trả lời."],
            },
            grammar_errors: [],
          };
        }
      }

      const gradedAnswer = {
        questionId: question._id,
        selectedAnswer: userAnswer?.selectedAnswer || "",
        isCorrect,
        pointsEarned,
        timeSpent: userAnswer?.timeSpent || 0,
      };

      // Chỉ thêm writingAnswer nếu có giá trị (không set null)
      if (
        userAnswer?.writingAnswer &&
        (userAnswer.writingAnswer.text ||
          userAnswer.writingAnswer.wordCount !== undefined)
      ) {
        gradedAnswer.writingAnswer = userAnswer.writingAnswer;
      }

      // Chỉ thêm speakingAnswer nếu có giá trị (không set null)
      if (
        userAnswer?.speakingAnswer &&
        (userAnswer.speakingAnswer.audioUrl ||
          userAnswer.speakingAnswer.duration !== undefined)
      ) {
        gradedAnswer.speakingAnswer = userAnswer.speakingAnswer;
      }

      // Lưu kết quả chấm điểm writing (nếu có)
      if (writingGrading) {
        gradedAnswer.writingGrading = writingGrading;
      }

      gradedAnswers.push(gradedAnswer);
    }

    return gradedAnswers;
  }

  /**
   * Helper method: Build detailed questions for a section
   * Formats questions with user answers, correct answers, and grading information
   * @private
   * @param {object} quiz - Quiz object with questions populated
   * @param {object} quizAttempt - QuizAttempt object with graded answers
   * @returns {Promise<Array>} Array of QuestionReview objects
   */
  async _buildDetailedQuestions(quiz, quizAttempt) {
    if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
      return [];
    }

    if (!quizAttempt || !quizAttempt.answers || !Array.isArray(quizAttempt.answers)) {
      return [];
    }

    // Create a map of answers by questionId for O(1) lookup
    const answerMap = new Map();
    quizAttempt.answers.forEach((answer) => {
      const questionId = answer.questionId?.toString();
      if (questionId) {
        answerMap.set(questionId, answer);
      }
    });

    // Build detailed questions (cần Promise.all vì có async operations trong map)
    const detailedQuestionsPromises = quiz.questions.map(async (question) => {
      const questionId = question._id?.toString();
      const answer = answerMap.get(questionId) || null;

      // Build user answer object
      const userAnswer = {
        selectedAnswer: answer?.selectedAnswer || null,
        timeSpent: answer?.timeSpent || 0,
      };

      // Add writingAnswer if exists
      if (answer?.writingAnswer) {
        userAnswer.writingAnswer = {
          text: answer.writingAnswer.text || "",
          wordCount: answer.writingAnswer.wordCount || 0,
        };
      }

      // Add speakingAnswer if exists
      if (answer?.speakingAnswer) {
        userAnswer.speakingAnswer = {
          audioUrl: answer.speakingAnswer.audioUrl || "",
          duration: answer.speakingAnswer.duration || 0,
        };
      }

      // Add matches for matching questions
      if (question.type === "matching" && answer?.matches) {
        userAnswer.matches = answer.matches;
      }

      // Build correct answer object
      let correctAnswer = null;
      if (question.type === "multiple_choice" || question.type === "true_false") {
        // For multiple choice, return all options with isCorrect flag
        correctAnswer = {
          options: (question.options || []).map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false,
          })),
        };
        // Also include the correct text for easy access
        const correctOption = question.options?.find((opt) => opt.isCorrect);
        if (correctOption) {
          correctAnswer.text = correctOption.text;
        }
      } else if (question.type === "fill_blank") {
        correctAnswer = {
          text: question.correctAnswer || "",
        };
      } else if (question.type === "matching") {
        // For matching questions, correctAnswer can be:
        // 1. An array of {key, value} pairs
        // 2. An object with matches property
        // 3. Extracted from options with isCorrect=true
        if (question.correctAnswer) {
          if (Array.isArray(question.correctAnswer)) {
            correctAnswer = { matches: question.correctAnswer };
          } else if (question.correctAnswer.matches) {
            correctAnswer = { matches: question.correctAnswer.matches };
          } else {
            correctAnswer = { matches: question.correctAnswer };
          }
        } else if (question.options && Array.isArray(question.options)) {
          // Extract correct pairs from options
          const correctPairs = question.options
            .filter((opt) => opt.isCorrect && opt.text)
            .map((opt) => {
              // Try to parse "left | right" format
              const parts = opt.text.split("|").map((s) => s.trim());
              if (parts.length === 2) {
                return { key: parts[0], value: parts[1] };
              }
              return { key: opt.text, value: opt.text };
            });
          if (correctPairs.length > 0) {
            correctAnswer = { matches: correctPairs };
          }
        }
      }
      // Note: writing and speaking don't have a single "correct" answer

      // Build question review object
      const questionReview = {
        questionId: question._id,
        questionText: question.questionText || "",
        questionType: question.type,
        points: question.points || 1,
        pointsEarned: answer?.pointsEarned || 0,
        isCorrect: answer?.isCorrect || false,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        explanation: question.explanation || null,
      };

      // Add writingGrading if exists (from grammar NLP service)
      // Format đầy đủ để frontend có thể hiển thị chi tiết feedback
      if (answer?.writingGrading) {
        questionReview.writingGrading = {
          grading: {
            score: answer.writingGrading.grading?.score || 0,
            level: answer.writingGrading.grading?.level || "Unknown",
            overall_comment:
              answer.writingGrading.grading?.overall_comment || "",
            suggestions: answer.writingGrading.grading?.suggestions || [],
          },
          grammar_errors: (answer.writingGrading.grammar_errors || []).map(
            (error) => ({
              message: error.message || "",
              shortMessage: error.shortMessage || "",
              replacements: error.replacements || [],
              offset: error.offset || 0,
              length: error.length || 0,
              // Thêm thông tin bổ sung nếu có
              ...(error.context && { context: error.context }),
              ...(error.sentence && { sentence: error.sentence }),
              ...(error.rule && { rule: error.rule }),
            })
          ),
          // Thêm original_text nếu có để frontend có thể highlight errors
          ...(answer.writingGrading.original_text && {
            original_text: answer.writingGrading.original_text,
          }),
        };
      } else if (question.type === "writing" && answer) {
        // Nếu là writing question nhưng không có writingGrading
        // Có thể exam đã được chấm điểm trước khi code mới được deploy
        // Hoặc có lỗi khi chấm điểm
        // Tự động chấm lại để có writingGrading
        const writingText =
          answer.writingAnswer?.text || answer.selectedAnswer || "";
        if (writingText && writingText.trim().length > 0) {
          try {
            // Chấm lại writing question để lấy writingGrading
            const gradingResult = await this._gradeWritingText(writingText);
            // Luôn có writingGrading, kể cả khi có lỗi (gradingResult.data sẽ có default values)
            if (gradingResult.data) {
              const apiData = gradingResult.data;

              // Format grammar_errors
              const formattedGrammarErrors = (apiData.grammar_errors || []).map(
                (error) => ({
                  message: error.message || "",
                  shortMessage: error.shortMessage || "",
                  replacements: (error.replacements || []).map((r) => ({
                    value: r.value || "",
                  })),
                  offset: error.offset || 0,
                  length: error.length || 0,
                  context: error.context || null,
                  sentence: error.sentence || null,
                  rule: error.rule
                    ? {
                        id: error.rule.id || "",
                        description: error.rule.description || "",
                        issueType: error.rule.issueType || "",
                        category: error.rule.category
                          ? {
                              id: error.rule.category.id || "",
                              name: error.rule.category.name || "",
                            }
                          : null,
                      }
                    : null,
                })
              );

              // Thêm writingGrading vào questionReview
              questionReview.writingGrading = {
                grading: {
                  score: apiData.grading?.score || 0,
                  level: apiData.grading?.level || "Unknown",
                  overall_comment: apiData.grading?.overall_comment || "",
                  suggestions: apiData.grading?.suggestions || [],
                },
                grammar_errors: formattedGrammarErrors,
                original_text: apiData.original_text || writingText,
              };
            }
          } catch (error) {
            console.error(
              `[ExamService] Error grading writing question ${questionId} on-the-fly:`,
              error
            );
            // Fallback: thêm writingGrading với default values nếu có lỗi
            questionReview.writingGrading = {
              grading: {
                score: 0,
                level: "Unknown",
                overall_comment: `Lỗi khi chấm điểm: ${error.message}`,
                suggestions: [],
              },
              grammar_errors: [],
              original_text: writingText,
            };
          }
        }
      }

      return questionReview;
    });

    // Wait for all questions to be processed (including async writing grading)
    const detailedQuestions = await Promise.all(detailedQuestionsPromises);
    return detailedQuestions;
  }

  /**
   * Helper method: Build exam result response
   * @private
   */
  async _buildExamResult(attempt) {
    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return {
        attemptId: attempt._id,
        status: attempt.status,
        totalScore: attempt.totalScore || 0,
        totalPercentage: attempt.totalPercentage || 0,
        totalTimeSpent: attempt.totalTimeSpent || 0,
        sections: attempt.sections || [],
      };
    }

    const sectionsResult = (attempt.sections || []).map((sectionAttempt) => {
      const sectionMeta = exam.sections?.find(
        (s) => s._id?.toString() === sectionAttempt.sectionId?.toString()
      );
      return {
        sectionId: sectionAttempt.sectionId,
        skill: sectionMeta?.skill || "unknown",
        score: sectionAttempt.score || 0,
        percentage: sectionAttempt.percentage || 0,
        timeSpent: sectionAttempt.timeSpent || 0,
      };
    });

    return {
      attemptId: attempt._id,
      status: attempt.status,
      totalScore: attempt.totalScore || 0,
      totalPercentage: attempt.totalPercentage || 0,
      totalTimeSpent: attempt.totalTimeSpent || 0,
      completedAt: attempt.completedAt,
      sections: sectionsResult,
    };
  }

  async getMyExamAttempts(req) {
    const userId = req.user?._id;
    const { page = 1, limit = 10 } = req.query || {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
      const [attempts, total] = await Promise.all([
        ExamAttempt.find({ user: toObjectId(userId) })
          .populate({
            path: "exam",
            select: "title description sections maxScore",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ExamAttempt.countDocuments({ user: toObjectId(userId) }),
      ]);
      const enrichedAttempts = [];
      for (const attempt of attempts) {
        if (!attempt.exam) continue;

        const learningPath = await LearningPathRepository.findByFinalExam(
          attempt.exam._id
        );

        let levelInfo = null;
        if (learningPath) {
          const level = learningPath.levels?.find(
            (lvl) => lvl.finalQuiz?.toString() === attempt.exam._id.toString()
          );
          if (level) {
            levelInfo = {
              levelOrder: level.order,
              levelTitle: level.title,
              learningPathTitle: learningPath.title,
            };
          }
        }

        enrichedAttempts.push({
          attemptId: attempt._id,
          exam: {
            id: attempt.exam._id,
            title: attempt.exam.title,
            description: attempt.exam.description,
            sectionsCount: attempt.exam.sections?.length || 0,
            maxScore: attempt.exam.maxScore || 100,
          },
          levelInfo,
          status: attempt.status,
          totalScore: attempt.totalScore || 0,
          totalPercentage: attempt.totalPercentage || 0,
          totalTimeSpent: attempt.totalTimeSpent || 0,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
        });
      }

      return ResponseBuilder.success("Lấy lịch sử exam thành công.", {
        attempts: enrichedAttempts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("[ExamService] Error getting exam attempts:", error);
      return ResponseBuilder.error(
        "Lỗi khi lấy lịch sử exam.",
        500,
        error.message
      );
    }
  }

  async getAvailableExams(req) {
    const userId = req.user?._id;
    const UserLearningPathRepository = require("../repositories/userLearningPath.repo");

    try {
      // Get user's active learning path
      const userPaths = await UserLearningPathRepository.findByUserId(userId);

      if (!userPaths || userPaths.length === 0) {
        return ResponseBuilder.success("Chưa có lộ trình học.", {
          exams: [],
          message: "Vui lòng hoàn thành onboarding để bắt đầu học.",
        });
      }

      const userLearningPath = userPaths[0];
      const learningPathId = userLearningPath.learningPath;

      // Get learning path with full details
      const learningPath =
        await LearningPathRepository.findByIdWithFullDetails(learningPathId);

      if (!learningPath) {
        return ResponseBuilder.success("Lấy danh sách exam thành công.", {
          exams: [],
          learningPath: null,
          message: "Learning path không tồn tại hoặc chưa có exam nào.",
        });
      }

      // Get user progress
      const userProgress = await UserProgressRepository.findByUserAndPath(
        userId,
        learningPathId
      );

      console.log("userProgress", userProgress);

      const availableExams = [];

      // Loop through each level
      for (const level of learningPath.levels || []) {
        if (!level.finalQuiz) continue; // Skip levels without exam

        // Get exam details
        const exam = await ExamRepository.findExamById(level.finalQuiz);
        if (!exam || exam.status === "deleted") continue;

        // Get required lessons in this level
        const requiredLessonIds = (level.lessons || [])
          .map((l) => l.lesson?._id.toString())
          .filter(Boolean);

        console.log("requiredLessonIds", requiredLessonIds);

        // Check completion status
        const completedLessonMap = new Map();
        if (userProgress?.lessonProgress) {
          userProgress.lessonProgress.forEach((lp) => {
            if (lp.isCompleted) {
              completedLessonMap.set(lp.lessonId.toString(), true);
            }
          });
        }

        const incompleteLessons = requiredLessonIds.filter(
          (lessonId) => !completedLessonMap.has(lessonId)
        );

        // Check if user has already taken this exam
        const existingAttempt = await ExamAttempt.findOne({
          user: toObjectId(userId),
          exam: exam._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        let status = "locked";
        let lastScore = null;
        let lastPercentage = null;
        let lastAttemptId = null;

        if (incompleteLessons.length === 0) {
          // All lessons completed
          if (existingAttempt?.status === "completed") {
            status = "completed";
            lastScore = existingAttempt.totalScore;
            lastPercentage = existingAttempt.totalPercentage;
            lastAttemptId = existingAttempt._id;
          } else if (existingAttempt?.status === "in_progress") {
            status = "in_progress";
            lastAttemptId = existingAttempt._id;
          } else {
            status = "available";
          }
        }

        availableExams.push({
          exam: {
            id: exam._id,
            title: exam.title,
            description: exam.description,
            sectionsCount: exam.sections?.length || 0,
            totalTimeLimit: exam.totalTimeLimit,
            maxScore: exam.maxScore || 100,
          },
          level: {
            order: level.order,
            title: level.title,
            totalLessons: requiredLessonIds.length,
            completedLessons:
              requiredLessonIds.length - incompleteLessons.length,
            incompleteLessonsCount: incompleteLessons.length,
          },
          status, // available | locked | completed | in_progress
          lastAttempt: lastAttemptId
            ? {
                attemptId: lastAttemptId,
                score: lastScore,
                percentage: lastPercentage,
              }
            : null,
        });
      }

      return ResponseBuilder.success("Lấy danh sách exam thành công.", {
        learningPath: {
          id: learningPath._id,
          title: learningPath.title,
        },
        exams: availableExams,
      });
    } catch (error) {
      console.error("[ExamService] Error getting available exams:", error);
      return ResponseBuilder.error(
        "Lỗi khi lấy danh sách exam.",
        500,
        error.message
      );
    }
  }
}

module.exports = new ExamService();
