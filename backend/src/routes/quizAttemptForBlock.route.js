const { Router } = require("express");
const quizAttemptForBlockController = require("../controllers/quizAttemptForBlock.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const {
  validateStartQuizAttempt,
  validateSubmitQuizAttempt,
} = require("../middlewares/quizAttempt.middleware");

const router = Router();

router.post(
  "/blocks/:blockId/quiz/start",
  auth.authenticate,
  validateStartQuizAttempt,
  asynchandler(quizAttemptForBlockController.startQuiz)
);

router.post(
  "/quiz-attempts/:attemptId/:lessonId/submit",
  auth.authenticate,
  validateSubmitQuizAttempt,
  asynchandler(quizAttemptForBlockController.submitQuiz)
);

router.get(
  "/blocks/:blockId/quiz/attempts",
  auth.authenticate,
  asynchandler(quizAttemptForBlockController.getAttemptHistory)
);

router.get(
  "/quiz-attempts/:attemptId",
  auth.authenticate,
  asynchandler(quizAttemptForBlockController.getAttemptDetail)
);

router.post(
  "/blocks/:blockId/quiz/retry",
  auth.authenticate,
  asynchandler(quizAttemptForBlockController.retryQuiz)
);

module.exports = router;
