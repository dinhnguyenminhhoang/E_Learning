"use strict";

const LearningPathService = require("../services/learningPath.service");

const LearningPathController = {
  async createNewPath(req, res) {
    const response = await LearningPathService.createNewPath(req);
    res.status(response.code).json(response);
  },

  async assignLessonToPath(req, res) {
    const response = await LearningPathService.assignLessonToPath(req);
    res.status(response.code).json(response);
  },

  async getAllPath(req, res) {
    console.log("ok");

    const response = await LearningPathService.getAllPath(req);
    res.status(response.code).json(response);
  },

  /**
   * Lấy Level / Module / Lesson trong 1 Learning Path
   * Query params:
   * - isLevel=true → Lấy toàn bộ level
   * - isModule=true&levelOrder=1 → Lấy toàn bộ module của level 1
   * - isLesson=true&moduleId=xxx → Lấy toàn bộ lesson của module đó
   */
  async getLearningPathHierarchy(req, res) {
    const response = await LearningPathService.getLearningPathHierarchy(req);
    res.status(response.code).json(response);
  },

  async createNewLevel(req, res) {
    const response = await LearningPathService.addNewLevelToPath(req);
    res.status(response.code).json(response);
  },

  async getByTarget(req, res) {
    const { targetIds } = req.body;
    const paths = await LearningPathService.getPathsByTargets(targetIds);
    res.status(paths.status).json(paths);
  },
};

module.exports = LearningPathController;
