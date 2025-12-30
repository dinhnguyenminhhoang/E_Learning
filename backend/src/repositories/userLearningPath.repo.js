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

  async findActiveByUserId(userId) {
    const result = await UserLearningPath.findOne({
      user: userId,
      status: "active",
    })
      .populate("learningPath")
      .populate("target")
      .lean();
    return result;
  }

  async findAllByUserId(userId) {
    return await UserLearningPath.find({ user: userId })
      .populate("learningPath")
      .populate("target")
      .lean();
  }

  async setActivePath(userId, learningPathId) {
    const deactivateResult = await UserLearningPath.updateMany(
      { user: userId },
      { $set: { status: "paused" } }
    );

    const result = await UserLearningPath.findOneAndUpdate(
      { user: userId, learningPath: learningPathId },
      { $set: { status: "active", lastAccAt: Date.now() } },
      { new: true }
    )
      .populate("learningPath")
      .populate("target");

    return result;
  }

  async deactivateAllPaths(userId) {
    return await UserLearningPath.updateMany(
      { user: userId },
      { $set: { status: "paused" } }
    );
  }

  async create(data) {
    return await UserLearningPath.create(data);
  }
  async update(id, updateData) {
    return await UserLearningPath.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}

module.exports = new UserLearningPathRepository();
