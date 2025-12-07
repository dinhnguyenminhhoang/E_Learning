"use strict";

const express = require("express");
const router = express.Router();

const ExamController = require("../controllers/exam.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

// ===== ADMIN ENDPOINTS =====
// Lấy tất cả exams (cho admin)
router.get(
  "/",
  authenticate,
  asynchandler(ExamController.getAllExams)
);

// Lấy exam theo ID (cho admin edit)
router.get(
  "/:examId",
  authenticate,
  asynchandler(ExamController.getExamById)
);

// Tạo exam mới (admin)
router.post(
  "/",
  authenticate,
  asynchandler(ExamController.createExam)
);

// Cập nhật exam (admin)
router.put(
  "/:examId",
  authenticate,
  asynchandler(ExamController.updateExam)
);

// Xóa exam (admin)
router.delete(
  "/:examId",
  authenticate,
  asynchandler(ExamController.deleteExam)
);

// ===== USER ENDPOINTS =====
// Bắt đầu làm exam (user)
router.post("/:examId/start", authenticate, asynchandler(ExamController.startExam));

router.get(
  "/exam-attempts/:attemptId/section/:sectionId",
  authenticate,
  asynchandler(ExamController.getSectionQuestions)
);

router.post(
  "/exam-attempts/:attemptId/section/:sectionId/submit",
  authenticate,
  asynchandler(ExamController.submitSection)
);

router.post(
  "/exam-attempts/:attemptId/submit",
  authenticate,
  asynchandler(ExamController.completeExam)
);

router.get(
  "/exam-attempts/:attemptId",
  authenticate,
  asynchandler(ExamController.getExamAttemptResult)
);

module.exports = router;


