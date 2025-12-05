"use strict";

const express = require("express");
const router = express.Router();

const ExamController = require("../controllers/exam.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.post("/", authenticate, asynchandler(ExamController.createExam));

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


