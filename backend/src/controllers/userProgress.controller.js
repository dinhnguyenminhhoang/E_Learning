const userProgressService = require("../services/userProgress.service");

class UserProgressController {
  async getUserProgress(req, res) {
    console.log("ok")
    const response = await userProgressService.getCompletedBlocksInLesson(req);
    return res.status(response.code).json(response);
  }
}
module.exports = new UserProgressController();
