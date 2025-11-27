"use strict";

const LearningPathService = require("../services/learningPath.service");

const LearningPathController = {
  async createNewPath(req, res) {
    const response = await LearningPathService.createNewPath(req);
    res.status(response.code).json(response);
  },

  async attachQuizToLevel(req, res) {
    const response = await LearningPathService.attachQuizToLevel(req);
    res.status(response.code).json(response);
  },

  async updateQuizInLevel(req, res) {
    const response = await LearningPathService.updateQuizInLevel(req);
    res.status(response.code).json(response);
  },

  async removeQuizFromLevel(req, res) {
    const response = await LearningPathService.removeQuizFromLevel(req);
    res.status(response.code).json(response);
  },

  async assignLessonToPath(req, res) {
    
    const response = await LearningPathService.assignLessonToPath(req);
    res.status(response.code).json(response);
  },

  async getAllPath(req, res) {
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

  async assignTargetToPath(req, res) {
    const response = await LearningPathService.assignTargetToLearningPath(req);
    res.status(response.code).json(response);
  },
};

module.exports = LearningPathController;
