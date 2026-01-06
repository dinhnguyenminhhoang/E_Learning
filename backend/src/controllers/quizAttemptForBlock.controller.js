const quizAttemptForBlockService = require("../services/quizAttemptForBlock.service");

class QuizAttemptForBlockController {
  async startQuiz(req, res) {
    const { blockId } = req.params;
    let { lessonId } = req.query;
    const userId = req.user._id;

    const result = await quizAttemptForBlockService.startQuizAttempt(
      userId,
      blockId,
      lessonId
    );
    return res.status(result.code).json(result);
  }

  async submitQuiz(req, res) {
    let { attemptId, lessonId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    // Debug: Log để kiểm tra body
    if (!answers) {
      console.warn(
        `[QuizAttemptForBlockController] submitQuiz - answers is missing. Body:`,
        JSON.stringify(req.body)
      );
    }

    const result = await quizAttemptForBlockService.submitQuiz(
      userId,
      attemptId,
      answers,
      lessonId
    );
    return res.status(result.code).json(result);
  }

  async getAttemptHistory(req, res) {
    const { blockId } = req.params;
    const userId = req.user._id;

    const result = await quizAttemptForBlockService.getAttemptHistory(
      userId,
      blockId
    );
    return res.status(result.code).json(result);
  }

  async getAttemptDetail(req, res) {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const result = await quizAttemptForBlockService.getAttemptDetail(
      userId,
      attemptId
    );
    return res.status(result.code).json(result);
  }

  async retryQuiz(req, res) {
    const { blockId } = req.params;
    const userId = req.user._id;

    const result = await quizAttemptForBlockService.retryQuiz(userId, blockId);
    return res.status(result.code).json(result);
  }
}

module.exports = new QuizAttemptForBlockController();
