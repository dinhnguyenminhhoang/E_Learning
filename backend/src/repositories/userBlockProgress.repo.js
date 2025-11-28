"use strict";

const UserBlockProgress = require("../models/UserBlockProgress");

class UserBlockProgressRepository {
  async create(data) {
    return await UserBlockProgress.create(data);
  }

  async findById(id) {
    return await UserBlockProgress.findById(id);
  }

  async findByUserAndBlock(userId, blockId) {
    return await UserBlockProgress.findByUserAndBlock(userId, blockId);
  }

  async findByUserAndLesson(userId, lessonId) {
    return await UserBlockProgress.findByUserAndLesson(userId, lessonId);
  }

  async getNextLockedBlock(userId, lessonId, currentBlockOrder) {
    return await UserBlockProgress.getNextLockedBlock(
      userId,
      lessonId,
      currentBlockOrder
    );
  }

  async update(id, updates) {
    return await UserBlockProgress.findByIdAndUpdate(id, updates, {
      new: true,
    });
  }

  async bulkCreate(dataArray) {
    return await UserBlockProgress.insertMany(dataArray, { ordered: false });
  }

  async findOne(filter) {
    return await UserBlockProgress.findOne(filter);
  }

  async findAll(filter) {
    return await UserBlockProgress.find(filter);
  }

  async deleteSoft(id) {
    return await UserBlockProgress.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new UserBlockProgressRepository();
