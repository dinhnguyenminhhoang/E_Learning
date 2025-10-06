"use strict";
const LearningPathService = require("../services/learningPath.service");

class LearningPathController {
  static async getByTarget(req, res) {
    const { targetIds } = req.body;
    const paths = await LearningPathService.getPathsByTargets(targetIds);
    res.status(paths.status).json(paths);
  }
}

module.exports = LearningPathController;
