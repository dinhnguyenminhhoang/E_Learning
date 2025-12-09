const userLearningPath = require("../services/userLearningPath.service");

class UserLearningPath {
  async getPathByUser(req, res) {
    const result = await userLearningPath.getUserLearningPaths(req);
    res.status(result.code).json(result);
  }

  async getUserOverview(req, res) {
    const result = await userLearningPath.getUserOverview(req);
    res.status(result.code).json(result);
  }
}
module.exports = new UserLearningPath();