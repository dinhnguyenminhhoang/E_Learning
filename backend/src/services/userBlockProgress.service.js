"use strict";

const UserBlockProgressRepo = require("../repositories/userBlockProgress.repo");
const LessonRepository = require("../repositories/lesson.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { HTTP_STATUS } = require("../constants/httpStatus");
const { default: AppError } = require("../utils/appError");

class UserBlockProgressService {
  async initializeBlockProgressForLesson(userId, lessonId) {
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    if (!lesson) {
      return ResponseBuilder.notFoundError();
    }

    const existing = await UserBlockProgressRepo.findByUserAndLesson(
      userId,
      lessonId
    );
    if (existing && existing.length > 0) {
      return ResponseBuilder.success(
        "Block progress đã được khởi tạo trước đó.",
        existing
      );
    }

    const blockProgressData = lesson.blocks.map((blockInfo, index) => ({
      user: userId,
      lesson: lessonId,
      block: blockInfo.block,
      blockOrder: blockInfo.order || index,
      status: index === 0 ? "not_started" : "locked",
      isLocked: index !== 0,
      exerciseCompleted: false,
      attempts: 0,
      lastAttemptScore: 0,
      timeSpent: 0,
    }));

    try {
      const created = await UserBlockProgressRepo.bulkCreate(blockProgressData);
      return ResponseBuilder.success(
        "Khởi tạo block progress thành công!",
        created
      );
    } catch (error) {
      if (error.code === 11000 || error.name === "MongoBulkWriteError") {
        const existingAfterError =
          await UserBlockProgressRepo.findByUserAndLesson(userId, lessonId);
        return ResponseBuilder.success(
          "Block progress được khởi tạo thành công.",
          existingAfterError
        );
      }
      throw error;
    }
  }

  async getBlockProgressByLesson(userId, lessonId) {
    const progress = await UserBlockProgressRepo.findByUserAndLesson(
      userId,
      lessonId
    );

    if (!progress || progress.length === 0) {
      return await this.initializeBlockProgressForLesson(userId, lessonId);
    }

    return ResponseBuilder.success("Lấy block progress thành công!", progress);
  }

  async getBlockProgress(userId, blockId) {
    const progress = await UserBlockProgressRepo.findByUserAndBlock(
      userId,
      blockId
    );

    if (!progress) {
      return ResponseBuilder.notFoundError();
    }

    return ResponseBuilder.success("Lấy block progress thành công!", progress);
  }

  async startBlock(userId, blockId) {
    const progress = await UserBlockProgressRepo.findByUserAndBlock(
      userId,
      blockId
    );

    if (!progress) {
      return ResponseBuilder.notFoundError();
    }

    if (progress.isLocked) {
      return ResponseBuilder.forbiddenError();
    }

    if(progress.status === "in_progress"){
      return ResponseBuilder.success("Block đã được bắt đầu trước đó.", progress);
    }

    if (progress.status === "completed") {
      return ResponseBuilder.success(
        "Block đã được hoàn thành trước đó.",
        progress
      );
    }

    await progress.start();

    return ResponseBuilder.success("Bắt đầu học block thành công!", progress);
  }

  async completeBlock(userId, blockId) {
    const progress = await UserBlockProgressRepo.findByUserAndBlock(
      userId,
      blockId
    );

    if (!progress) {
      return ResponseBuilder.notFoundError();
    }

    if (!progress.exerciseCompleted) {
      return ResponseBuilder.forbiddenError();
    }

    await progress.complete();

    await this.unlockNextBlock(userId, progress.lesson, progress.blockOrder);

    return ResponseBuilder.success("Hoàn thành block thành công!", progress);
  }

  async unlockNextBlock(userId, lessonId, currentBlockOrder) {
    const nextBlock = await UserBlockProgressRepo.getNextLockedBlock(
      userId,
      lessonId,
      currentBlockOrder
    );

    if (nextBlock && nextBlock.isLocked) {
      await nextBlock.unlock();
      return nextBlock;
    }

    return null;
  }

  async recordQuizAttempt(userId, blockId, score, isPassed) {
    const progress = await UserBlockProgressRepo.findByUserAndBlock(
      userId,
      blockId
    );

    if (!progress) {
      throw new AppError(
        "Không tìm thấy block progress.",
        HTTP_STATUS.NOT_FOUND
      );
    }

    await progress.recordAttempt(score, isPassed);

    if (isPassed) {
      await this.unlockNextBlock(userId, progress.lesson, progress.blockOrder);
    }

    return progress;
  }
}

module.exports = new UserBlockProgressService();
