"use strict";

const UserLearningPath = require("../models/UserLearningPath");

class UserLearningPathRepository {
  // Tìm UserLearningPath theo user
  async findByUserId(userId) {
    return await UserLearningPath.find({ user: userId })
      .populate("learningPath")
      .populate("target");
  }

  async findByUserAndPath(userId, learningPathId) {
    return await UserLearningPath.findOne({
      user: userId,
      learningPath: learningPathId,
    }).lean();
  }

  async findByUserId(userId) {
    return await UserLearningPath.find({ user: userId }).lean();
  }
  // Tạo mới UserLearningPath
  async create(data) {
    return await UserLearningPath.create(data);
  }

  // Cập nhật UserLearningPath
  async update(id, updateData) {
    return await UserLearningPath.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}

module.exports = new UserLearningPathRepository();
