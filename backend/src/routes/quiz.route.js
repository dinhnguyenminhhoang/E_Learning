const { Router } = require("express");
const quizController = require("../controllers/quiz.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const { validateCreateQuiz, validateUpdateQuiz } = require("../middlewares/quiz");

const router = Router();
router.get(
  "/getAll",
  auth.authenticate,
  asynchandler(quizController.getAllQuizzes)
);
router.post(
  "/create",
  auth.authenticate,
  validateCreateQuiz,
  asynchandler(quizController.createQuiz)
);

router.put(
  "/update/:id",
  auth.authenticate,
  validateUpdateQuiz,
  asynchandler(quizController.updateQuiz)
);

router.get(
  "/getById/:id",
  auth.authenticate,
  asynchandler(quizController.getQuizById)
);

router.delete(
  "/delete/:id",
  auth.authenticate,
  asynchandler(quizController.deleteQuiz)
);
module.exports = router;
