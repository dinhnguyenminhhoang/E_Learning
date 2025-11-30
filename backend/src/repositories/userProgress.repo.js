"use strict";

const UserProgress = require("../models/UserProgress");
const { toObjectId } = require("../helpers/idHelper");

class UserProgressRepository {
  // Tìm UserProgress theo user và learningPath
  async findByUserAndPath(userId, learningPathId) {
    return await UserProgress.findOne({
      user: toObjectId(userId),
      learningPath: toObjectId(learningPathId),
    });
  }

  // Tìm hoặc tạo UserProgress
  async findOrCreate(userId, learningPathId) {
    let progress = await this.findByUserAndPath(userId, learningPathId);
    if (!progress) {
      progress = await UserProgress.create({
        user: toObjectId(userId),
        learningPath: toObjectId(learningPathId),
        status: "not_started",
      });
    }
    return progress;
  }

  // Lấy block progress của user
  async getBlockProgress(userId, learningPathId, lessonId, blockId) {
    const progress = await this.findByUserAndPath(userId, learningPathId);
    if (!progress) {
      return null;
    }

    const blockProgress = progress.getBlockProgress(
      toObjectId(lessonId),
      toObjectId(blockId)
    );

    return blockProgress;
  }

  // Lấy lesson progress của user
  async getLessonProgress(userId, learningPathId, lessonId) {
    const progress = await this.findByUserAndPath(userId, learningPathId);
    if (!progress) {
      return null;
    }

    const lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
    return lessonProgress;
  }

  // Cập nhật block progress
  async updateBlockProgress(
    userId,
    learningPathId,
    lessonId,
    blockId,
    maxWatchedTime,
    videoDuration
  ) {
    const progress = await this.findOrCreate(userId, learningPathId);

    progress.updateBlockProgress(
      toObjectId(lessonId),
      toObjectId(blockId),
      maxWatchedTime,
      videoDuration
    );

    await progress.save();
    return progress;
  }

  // Kiểm tra lesson đã hoàn thành chưa (dựa trên tất cả block)
  async checkAndUpdateLessonCompletion(
    userId,
    learningPathId,
    lessonId,
    totalBlocksInLesson
  ) {
    const progress = await this.findByUserAndPath(userId, learningPathId);
    if (!progress) {
      return false;
    }

    const lessonProgress = progress.getLessonProgress(toObjectId(lessonId));
    if (!lessonProgress) {
      return false;
    }

    // Đếm số block đã completed
    const completedBlocks = lessonProgress.blockProgress.filter(
      (bp) => bp.isCompleted
    ).length;

    // Nếu tất cả block đã completed
    if (
      !lessonProgress.isCompleted &&
      completedBlocks >= totalBlocksInLesson &&
      totalBlocksInLesson > 0
    ) {
      lessonProgress.isCompleted = true;
      lessonProgress.completedAt = new Date();

      // Cập nhật lessonLeaned nếu chưa có
      const lessonIdObj = toObjectId(lessonId);
      if (
        !progress.lessonLeaned.some(
          (id) => id.toString() === lessonIdObj.toString()
        )
      ) {
        progress.lessonLeaned.push(lessonIdObj);
      }

      await progress.save();
      return true;
    }

    return lessonProgress.isCompleted;
  }

  // Cập nhật lastAccessedBlockId (khi user chọn xem một block)
  async updateLastAccessedBlock(
    userId,
    learningPathId,
    lessonId,
    blockId
  ) {
    const progress = await this.findOrCreate(userId, learningPathId);
    progress.updateLastAccessedBlock(toObjectId(lessonId), toObjectId(blockId));
    await progress.save();
    return progress;
  }

  // Lưu progress
  async save(progress) {
    return await progress.save();
  }
}

module.exports = new UserProgressRepository();

