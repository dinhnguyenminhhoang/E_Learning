const userBlockProgressService = require("../services/userBlockProgress.service");

class UserBlockProgressController {
  async initializeBlockProgress(req, res) {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const result =
      await userBlockProgressService.initializeBlockProgressForLesson(
        userId,
        lessonId
      );
    return res.status(result.code).json(result);
  }

  async getLessonBlocksProgress(req, res) {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const result = await userBlockProgressService.getBlockProgressByLesson(
      userId,
      lessonId
    );
    return res.status(result.code).json(result);
  }

  async getBlockProgress(req, res) {
    const { blockId } = req.params;
    const userId = req.user._id;

    const result = await userBlockProgressService.getBlockProgress(
      userId,
      blockId
    );
    return res.status(result.code).json(result);
  }

  async startBlock(req, res) {
    const { blockId } = req.params;
    const userId = req.user._id;

    const result = await userBlockProgressService.startBlock(userId, blockId);
    return res.status(result.code).json(result);
  }

  async completeBlock(req, res) {
    const { blockId } = req.params;
    const userId = req.user._id;

    const result = await userBlockProgressService.completeBlock(
      userId,
      blockId
    );
    return res.status(result.code).json(result);
  }
}

module.exports = new UserBlockProgressController();
