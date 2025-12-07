const quizService = require("../services/quiz.service");

class QuizController {
  async createQuiz(req, res) {
    const quiz = await quizService.createQuiz(req);
    return res.status(quiz.code).json(quiz);
  }

  async getAllQuizzes(req, res) {
    const quiz = await quizService.getAllQuizzes(req);
    return res.status(quiz.code).json(quiz);
  }

  async getQuizById(req, res) {
    const quiz = await quizService.getQuizById(req);
    return res.status(quiz.code).json(quiz);
  }

  async updateQuiz(req, res) {
    const quiz = await quizService.updateQuiz(req);
    return res.status(quiz.code).json(quiz);
  }

  async deleteQuiz(req, res) {
    const quiz = await quizService.deleteQuiz(req);
    return res.status(quiz.code).json(quiz);
  }

  async addQuestions(req, res) {
    const quiz = await quizService.addQuestions(req);
    return res.status(quiz.code).json(quiz);
  }

  async updateQuestion(req, res) {
    const result = await quizService.updateQuestion(req);
    return res.status(result.code).json(result);
  }

  async deleteQuestion(req, res) {
    const result = await quizService.deleteQuestion(req);
    return res.status(result.code).json(result);
  }
}
module.exports = new QuizController();
