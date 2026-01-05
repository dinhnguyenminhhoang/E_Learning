"use strict";

const UserLearningPath = require("../models/UserLearningPath");

class UserLearningPathRepository {
  // Tìm UserLearningPath theo user
  // async findByUserId(userId) {
  //   return await UserLearningPath.find({ user: userId })
  //     .populate("listPath")
  //     .populate("learningPath")
  //     .populate("target");
  // }

  async findPathsByUser(userId) {
    return await UserLearningPath.find({ user: userId })
      .populate("listPath")
      .populate("learningPath")
      .populate("target")
      .lean();
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

  async findByUserIdWithPopulate(userId) {
    return await UserLearningPath.findOne({ user: userId });
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

  async existingPathByUser(userId, learningPathId) {
    const result = await UserLearningPath.findOne({
      user: userId,
      listPath: learningPathId,
    });

    return result;
  }
}

module.exports = new UserLearningPathRepository();
