"use strict";
const LearningPath = require("../models/LearningPath");

class LearningPathRepo {
  static async findByTargetIds(targetIds) {
    return LearningPath.find({ target: { $in: targetIds } }).lean();
  }
}

module.exports = LearningPathRepo;
