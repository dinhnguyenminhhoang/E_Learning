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
}
module.exports = new QuizController();
