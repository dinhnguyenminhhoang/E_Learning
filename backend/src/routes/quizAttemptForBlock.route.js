const { Router } = require("express");
const quizAttemptForBlockController = require("../controllers/quizAttemptForBlock.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.post(
  "/blocks/:blockId/quiz/start",
  auth.authenticate,
  asynchandler(quizAttemptForBlockController.startQuiz)
);

router.post(
  "/quiz-attempts/:attemptId/submit",
  auth.authenticate,
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
