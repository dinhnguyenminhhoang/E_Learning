const { Router } = require("express");
const quizController = require("../controllers/quiz.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const { validateCreateQuiz, validateUpdateQuiz, validateAddQuestions } = require("../middlewares/quiz");

const router = Router();

router.get("/getAll", auth.authenticate, asynchandler(quizController.getAllQuizzes));
router.post("/create", auth.authenticate, validateCreateQuiz, asynchandler(quizController.createQuiz));
router.put("/update/:id", auth.authenticate, validateUpdateQuiz, asynchandler(quizController.updateQuiz));
router.get("/getById/:id", auth.authenticate, asynchandler(quizController.getQuizById));
router.delete("/delete/:id", auth.authenticate, asynchandler(quizController.deleteQuiz));
router.post("/:id/questions", auth.authenticate, validateAddQuestions, asynchandler(quizController.addQuestions));
router.put("/:id/questions/:questionId", auth.authenticate, asynchandler(quizController.updateQuestion));
router.delete("/:id/questions/:questionId", auth.authenticate, asynchandler(quizController.deleteQuestion));

module.exports = router;
