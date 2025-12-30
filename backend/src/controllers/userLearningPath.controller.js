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

  async addLearningPath(req, res) {
    const result = await userLearningPath.addNewLearningPath(req);
    res.status(result.code).json(result);
  }

  async switchPath(req, res) {
    const result = await userLearningPath.switchActivePath(req);
    res.status(result.code).json(result);
  }

  async getAllPaths(req, res) {
    const result = await userLearningPath.getAllUserPaths(req);
    res.status(result.code).json(result);
  }
}
module.exports = new UserLearningPath();