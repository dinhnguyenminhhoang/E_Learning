"use strict";

const UserLearningPathModel = require("../models/UserLearningPath");

class UserLearningPathRepository {
  // Tìm UserLearningPath theo user
  async findByUserId(userId) {
    return await UserLearningPathModel.find({ user: userId })
      .populate("learningPath")
      .populate("target");
  }

  // Tìm theo user + learningPath (để tránh trùng)
  async findByUserAndPath(userId, learningPathId) {
    return await UserLearningPathModel.findOne({
      user: userId,
      learningPath: learningPathId,
    });
  }

  // Tạo mới UserLearningPath
  async create(data) {
    return await UserLearningPathModel.create(data);
  }

  // Cập nhật UserLearningPath
  async update(id, updateData) {
    return await UserLearningPathModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}

module.exports = new UserLearningPathRepository();
