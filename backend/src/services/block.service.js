const { toObjectId } = require("../helpers/idHelper");
const lessonBlockHelper = require("../helpers/lessonBlock.helper");
const BlockRepository = require("../repositories/block.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const LessonRepository = require("../repositories/lesson.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { default: AppError } = require("../utils/appError");
class BlockService {
  async existingBlock(blockId) {
    const block = await BlockRepository.getBlockById(toObjectId(blockId));
    if (!block) {
      throw new AppError("Block not found.", 404);
    }
    return block;
  }
  async getBlockById(req) {
    const { blockId } = req.params;
    const block = await this.existingBlock(blockId);
    return ResponseBuilder.success({
      message: "Fetched block successfully",
      data: block,
    });
  }

  /**
   * Lấy block kèm progress của user (để resume video)
   */
  async getBlockWithProgress(req) {
    const { blockId } = req.params;
    const userId = req.user._id;
    const { learningPathId } = req.query;

    // Lấy block
    const block = await this.existingBlock(blockId);

    // Lấy learningPathId (từ query hoặc từ userLearningPath đầu tiên)
    let pathId = learningPathId;
    if (!pathId) {
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      return ResponseBuilder.success({
        message: "Fetched block successfully",
        data: {
          block,
          progress: {
            maxWatchedTime: 0,
            videoDuration: 0,
            isCompleted: false,
          },
        },
      });
    }

    // Lấy lessonId từ block
    let lessonId = block.lessonId;
    if (!lessonId) {
      // Nếu block không có lessonId, tìm từ Lesson
      const lessons = await LessonRepository.getLessonsByBlockId(blockId);
      if (lessons && lessons.length > 0) {
        lessonId = lessons[0]._id;
      }
    }

    if (!lessonId) {
      return ResponseBuilder.success({
        message: "Fetched block successfully",
        data: {
          block,
          progress: {
            maxWatchedTime: 0,
            videoDuration: 0,
            isCompleted: false,
          },
        },
      });
    }

    // Lấy block progress
    const blockProgress = await UserProgressRepository.getBlockProgress(
      userId,
      pathId,
      lessonId,
      blockId
    );

    return ResponseBuilder.success({
      message: "Fetched block with progress successfully",
      data: {
        block,
        progress: blockProgress
          ? {
              maxWatchedTime: blockProgress.maxWatchedTime,
              videoDuration: blockProgress.videoDuration,
              isCompleted: blockProgress.isCompleted,
            }
          : {
              maxWatchedTime: 0,
              videoDuration: 0,
              isCompleted: false,
            },
      },
    });
  }

  /**
   * Track video heartbeat - cập nhật progress khi user xem video
   */
  async trackVideoHeartbeat(req) {
    const { blockId } = req.params;
    const userId = req.user._id;
    const { learningPathId, maxWatchedTime, videoDuration } = req.body;

    if (
      typeof maxWatchedTime !== "number" ||
      maxWatchedTime < 0 ||
      typeof videoDuration !== "number" ||
      videoDuration < 0
    ) {
      throw new AppError(
        "maxWatchedTime and videoDuration must be valid numbers",
        400
      );
    }

    // Validate: maxWatchedTime không được vượt quá videoDuration
    if (maxWatchedTime > videoDuration && videoDuration > 0) {
      throw new AppError(
        "maxWatchedTime cannot exceed videoDuration",
        400
      );
    }

    // Lấy block để validate
    const block = await this.existingBlock(blockId);

    // Lấy learningPathId (từ body hoặc từ userLearningPath đầu tiên)
    let pathId = learningPathId;
    if (!pathId) {
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      throw new AppError("Learning path not found for user", 404);
    }

    // Lấy lessonId từ block
    let lessonId = block.lessonId;
    if (!lessonId) {
      // Nếu block không có lessonId, tìm từ Lesson
      const lessons = await LessonRepository.getLessonsByBlockId(blockId);
      if (lessons && lessons.length > 0) {
        lessonId = lessons[0]._id;
      }
    }

    if (!lessonId) {
      throw new AppError("Lesson not found for this block", 404);
    }

    // Lấy progress hiện tại để validate chống tua nhảy vọt
    const existingProgress = await UserProgressRepository.getBlockProgress(
      userId,
      pathId,
      lessonId,
      blockId
    );

    // Validation: Chống tua nhảy vọt bất thường
    let validatedMaxWatchedTime = maxWatchedTime;
    if (existingProgress && existingProgress.maxWatchedTime > 0) {
      const timeSinceLastUpdate =
        (new Date() - new Date(existingProgress.lastUpdatedAt)) / 1000; // seconds
      const reportedIncrease = maxWatchedTime - existingProgress.maxWatchedTime;

      // Cho phép tăng tối đa = thời gian thực tế + tolerance (15 giây)
      // Ví dụ: Nếu 30s trước update lần cuối, chỉ cho phép tăng tối đa 30 + 15 = 45s
      const maxAllowedIncrease = timeSinceLastUpdate + 15;

      if (reportedIncrease > maxAllowedIncrease) {
        // Nếu tăng quá nhanh, clamp lại về giá trị hợp lý
        const clampedMaxWatchedTime =
          existingProgress.maxWatchedTime + maxAllowedIncrease;

        // Log warning (có thể gửi alert cho admin nếu cần)
        console.warn(
          `[Anti-Cheat] User ${userId} tried to skip: ${reportedIncrease}s in ${timeSinceLastUpdate}s. Clamped to ${clampedMaxWatchedTime}s`
        );

        // Sử dụng giá trị đã clamp
        validatedMaxWatchedTime = Math.min(clampedMaxWatchedTime, videoDuration);
      }
    }

    // Cập nhật block progress (sử dụng giá trị đã validate)
    const progress = await UserProgressRepository.updateBlockProgress(
      userId,
      pathId,
      lessonId,
      blockId,
      validatedMaxWatchedTime,
      videoDuration
    );

    // Lấy block progress sau khi update
    const updatedBlockProgress = progress.getBlockProgress(
      toObjectId(lessonId),
      toObjectId(blockId)
    );

    // Kiểm tra và cập nhật lesson completion
    // Lấy tổng số block trong lesson
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    const totalBlocks = lesson?.blocks?.length || 0;

    if (totalBlocks > 0) {
      await UserProgressRepository.checkAndUpdateLessonCompletion(
        userId,
        pathId,
        lessonId,
        totalBlocks
      );
    }
    console.log("Updated block progress:", updatedBlockProgress);
    return ResponseBuilder.success({
      message: "Video progress updated successfully",
      data: {
        isCompleted: updatedBlockProgress?.isCompleted || false,
        maxWatchedTime: updatedBlockProgress?.maxWatchedTime || 0,
        videoDuration: updatedBlockProgress?.videoDuration || 0,
        progressPercentage:
          updatedBlockProgress?.videoDuration > 0
            ? Math.round(
                (updatedBlockProgress.maxWatchedTime /
                  updatedBlockProgress.videoDuration) *
                  100
              )
            : 0,
      },
    });
  }

  async createBlockContent(req) {
    const block = req.body;
    const createdBlock = await BlockRepository.create(block);
    return ResponseBuilder.success({
      message: "Block created successfully",
      data: createdBlock,
    });
  }

  async updateBlockContent(req) {
    const { blockId } = req.params;
    const blockUpdates = req.body;
    const existingBlock = await this.existingBlock(blockId);
    if (existingBlock.order !== blockUpdates.order) {
      await lessonBlockHelper.checkOrderExists(
        existingBlock,
        blockUpdates.order
      );
    }

    const updatedBlock = await BlockRepository.update(
      toObjectId(blockId),
      blockUpdates
    );
    return ResponseBuilder.success({
      message: "Block updated successfully",
      data: updatedBlock,
    });
  }

  async deleteBlockContent(req) {
    const { blockId } = req.params;
    await this.existingBlock(blockId);
    try {
      await lessonBlockHelper.deleteBlockFromLesson(blockId);
      await BlockRepository.softDelete(toObjectId(blockId));
      return ResponseBuilder.success("Block deleted successfully");
    } catch (error) {
      throw new AppError("Failed to remove block from lesson.", 500);
    }
  }
}
module.exports = new BlockService();
