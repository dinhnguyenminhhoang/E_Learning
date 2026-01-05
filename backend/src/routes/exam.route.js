"use strict";

const express = require("express");
const router = express.Router();

const ExamController = require("../controllers/exam.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");
const {
  validateCreateExam,
  validateUpdateExam,
  validateSubmitSection,
} = require("../middlewares/exam.middleware");

// ===== ADMIN ENDPOINTS =====
router.get("/", authenticate, asynchandler(ExamController.getAllExams));
router.get("/:examId", authenticate, asynchandler(ExamController.getExamById));

router.post(
  "/",
  authenticate,
  validateCreateExam,
  asynchandler(ExamController.createExam)
);

router.put(
  "/:examId",
  authenticate,
  validateUpdateExam,
  asynchandler(ExamController.updateExam)
);

router.delete(
  "/:examId",
  authenticate,
  asynchandler(ExamController.deleteExam)
);

// ===== USER ENDPOINTS =====
router.post(
  "/:examId/start",
  authenticate,
  asynchandler(ExamController.startExam)
);

router.get(
  "/exam-attempts/:attemptId/section/:sectionId",
  authenticate,
  asynchandler(ExamController.getSectionQuestions)
);

router.post(
  "/exam-attempts/:attemptId/section/:sectionId/submit",
  authenticate,
  validateSubmitSection,
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

router.get(
  "/user/my-attempts",
  authenticate,
  asynchandler(ExamController.getMyExamAttempts)
);

router.get(
  "/user/available",
  authenticate,
  asynchandler(ExamController.getAvailableExams)
);

module.exports = router;
