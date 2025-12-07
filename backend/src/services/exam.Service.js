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

class ExamService {
  // ===== ADMIN METHODS =====

  /**
   * Lấy tất cả exams (cho admin)
   * Query params:
   * - page: số trang (default: 1)
   * - limit: số items per page (default: 20)
   * - status: filter theo status
   * - search: tìm kiếm theo title
   */
  async getAllExams(req) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
    } = req.query || {};

    const filter = {};
    if (status) {
      filter.status = status;
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

    return ResponseBuilder.success(
      "Lấy danh sách exams thành công.",
      {
        exams,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      }
    );
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

    return ResponseBuilder.success(
      "Lấy exam thành công.",
      exam
    );
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
    const { title, description, totalTimeLimit, sections } = req.body || {};

    if (!title || !Array.isArray(sections) || sections.length === 0) {
      return ResponseBuilder.badRequest(
        "Tiêu đề exam và danh sách sections là bắt buộc."
      );
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
      }))
      .sort((a, b) => a.order - b.order);

    const examPayload = {
      title,
      description: description || null,
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
      const quizIds = updateData.sections.map((sec) => sec.quiz).filter(Boolean);

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

    return ResponseBuilder.success(
      "Cập nhật exam thành công.",
      updatedExam
    );
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

    return ResponseBuilder.success(
      "Xóa exam thành công.",
      { examId }
    );
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
      console.log(`[Level Validation] LearningPath not found for exam: ${exam._id}`);
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
      throw new AppError("Không tìm thấy level chứa exam này.", HTTP_STATUS.FORBIDDEN);
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

  async startExam(req) {
    const { examId } = req.params;
    const userId = req.user?._id;
    const exam = await ExamRepository.findExamById(toObjectId(examId));
    if (!exam) {
      return ResponseBuilder.notFoundError("Exam không tồn tại.");
    }

    // Không cho start nếu đã có exam attempt đang in_progress
    const existingAttempt = await ExamRepository.findActiveExamAttempt(
      userId,
      exam._id
    );
    if (existingAttempt) {
      return ResponseBuilder.success(
        "Bạn đang có bài thi đang làm dở.",
        existingAttempt
      );
    }

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

    const examAttempt = await ExamRepository.createExamAttempt(
      examAttemptPayload
    );

    return ResponseBuilder.success(
      "Bắt đầu làm exam thành công.",
      examAttempt,
      HTTP_STATUS.CREATED
    );
  }

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
      return ResponseBuilder.forbiddenError("Bạn không có quyền truy cập attempt này.");
    }

    const sectionAttempt =
      attempt.sections?.find(
        (s) => s.sectionId?.toString() === sectionId?.toString()
      ) || null;
    if (!sectionAttempt) {
      return ResponseBuilder.notFoundError("Không tìm thấy section trong attempt.");
    }

    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam.");
    }

    const sectionMeta =
      exam.sections?.find((s) => s._id?.toString() === sectionId?.toString()) ||
      null;
    if (!sectionMeta) {
      return ResponseBuilder.notFoundError("Không tìm thấy section trong exam.");
    }

    const quiz = await QuizRepository.getQuizById(sectionAttempt.quizAttempt);
    if (!quiz) {
      return ResponseBuilder.notFoundError("Không tìm thấy quiz.");
    }

    const timeLimit = sectionMeta.timeLimit ?? null;
    const timeSpent = sectionAttempt.timeSpent ?? 0;
    const remainingTime =
      timeLimit != null ? Math.max(timeLimit - timeSpent, 0) : null;

    return ResponseBuilder.success(
      "Lấy câu hỏi section thành công.",
      {
        sectionId: sectionMeta._id,
        skill: sectionMeta.skill,
        timeLimit,
        timeSpent,
        remainingTime,
        questions: quiz.questions || [],
      }
    );
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
    console.log("ok")

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
      if (answer.writingAnswer && (answer.writingAnswer.text || answer.writingAnswer.wordCount !== undefined)) {
        answerObj.writingAnswer = answer.writingAnswer;
      }

      // Chỉ thêm speakingAnswer nếu có giá trị (không set null)
      if (answer.speakingAnswer && (answer.speakingAnswer.audioUrl || answer.speakingAnswer.duration !== undefined)) {
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
    if (attempt.status === "completed") {
      return ResponseBuilder.success(
        "Exam đã được hoàn thành trước đó.",
        await this._buildExamResult(attempt)
      );
    }

    // Kiểm tra tất cả section đã submit chưa
    const incompleteSections = attempt.sections?.filter(
      (s) => s.status !== "completed"
    );
    if (incompleteSections && incompleteSections.length > 0) {
      return ResponseBuilder.badRequest(
        `Bạn cần hoàn thành tất cả ${incompleteSections.length} section còn lại trước khi nộp exam.`
      );
    }

    // Lấy exam để lấy thông tin sections
    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam.");
    }

    // Chấm điểm tất cả sections
    const gradedSections = [];
    let totalScore = 0;
    let totalPercentage = 0;
    let totalTimeSpent = 0;

    for (const sectionAttempt of attempt.sections || []) {
      // Lấy quiz attempt
      const quizAttempt = await QuizAttemptRepository.findById(
        sectionAttempt.quizAttempt
      );
      if (!quizAttempt) {
        console.error(
          `QuizAttempt not found: ${sectionAttempt.quizAttempt}`
        );
        continue;
      }

      // Lấy quiz để chấm điểm
      const quiz = await QuizRepository.getQuizById(quizAttempt.quiz);
      if (!quiz) {
        console.error(`Quiz not found: ${quizAttempt.quiz}`);
        continue;
      }

      // Chấm điểm từ raw answers đã lưu (bao gồm writing nếu có)
      const gradedAnswers = await this._gradeAnswers(
        quiz.questions,
        quizAttempt.answers || []
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
      const writingQuestions = quiz.questions.filter((q) => q.type === "writing");
      if (writingQuestions.length > 0) {
        // Nếu có writing questions, tính percentage dựa trên điểm trung bình từ API
        const writingAnswers = gradedAnswers.filter(
          (a) => writingQuestions.some((q) => q._id.toString() === a.questionId.toString())
        );
        if (writingAnswers.length > 0) {
          const avgWritingScore = writingAnswers.reduce((sum, a) => {
            const apiScore = a.writingGrading?.grading?.score || 0;
            return sum + apiScore;
          }, 0) / writingAnswers.length;

          // Tính percentage cho toàn bộ section (kết hợp writing và các câu khác)
          const nonWritingCount = totalCount - writingAnswers.length;
          const nonWritingCorrect = correctCount - writingAnswers.filter((a) => a.isCorrect).length;
          const nonWritingPercentage = nonWritingCount > 0
            ? Math.round((nonWritingCorrect / nonWritingCount) * 100)
            : 0;

          sectionPercentage = Math.round(
            (avgWritingScore * writingAnswers.length + nonWritingPercentage * nonWritingCount) / totalCount
          );
        } else {
          sectionPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        }
      } else {
        sectionPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      }

      // Cập nhật quiz attempt với kết quả đã chấm
      quizAttempt.answers = gradedAnswers; // Thay raw answers bằng graded answers
      quizAttempt.score = sectionScore;
      quizAttempt.percentage = sectionPercentage;
      quizAttempt.status = "completed";
      quizAttempt.completedAt = new Date();
      await quizAttempt.save();

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
      totalTimeSpent,
      completedAt: new Date(),
    });

    return ResponseBuilder.success("Hoàn thành exam thành công.", {
      attemptId: updatedAttempt._id,
      totalScore,
      totalPercentage: averagePercentage,
      totalTimeSpent,
      completedAt: updatedAttempt.completedAt,
      sections: gradedSections,
    });
  }

  /**
   * Lấy kết quả exam sau khi hoàn thành
   * GET /exam-attempts/:attemptId
   */
  async getExamAttemptResult(req) {
    const { attemptId } = req.params;
    const userId = req.user?._id;

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

    // Lấy exam để lấy thông tin section (skill)
    const exam = await ExamRepository.findExamById(attempt.exam);
    if (!exam) {
      return ResponseBuilder.notFoundError("Không tìm thấy exam.");
    }

    // Build response với skill từ exam.sections
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
        status: sectionAttempt.status,
      };
    });

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

  /**
   * Helper method: Chấm điểm writing bằng API grammar-nlp-service
   * @private
   * @param {string} text - Text cần chấm điểm
   * @returns {Promise<object>} Kết quả chấm điểm từ API
   */
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
        const questionId = answer.questionId?.toString() || answer._id?.toString();
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
        const writingText = userAnswer?.writingAnswer?.text || userAnswer?.selectedAnswer || "";

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
      if (userAnswer?.writingAnswer && (userAnswer.writingAnswer.text || userAnswer.writingAnswer.wordCount !== undefined)) {
        gradedAnswer.writingAnswer = userAnswer.writingAnswer;
      }

      // Chỉ thêm speakingAnswer nếu có giá trị (không set null)
      if (userAnswer?.speakingAnswer && (userAnswer.speakingAnswer.audioUrl || userAnswer.speakingAnswer.duration !== undefined)) {
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
}

module.exports = new ExamService();
