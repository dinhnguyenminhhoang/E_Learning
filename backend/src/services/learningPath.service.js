"use strict";
const LearningPathRepo = require("../repositories/learningPath.repo");

class LearningPathService {
  static async getPathsByTargets(targetIds) {
    const paths = LearningPathRepo.findByTargetIds(targetIds);
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, paths);
  }
}

module.exports = LearningPathService;
