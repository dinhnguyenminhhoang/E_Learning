const { toObjectId } = require("../helpers/idHelper");
const lessonBlockHelper = require("../helpers/lessonBlock.helper");
const BlockRepository = require("../repositories/block.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const LessonRepository = require("../repositories/lesson.repo");
const QuizAttemptForBlockRepository = require("../repositories/quizAttemptForBlock.repo");
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

    // Kiểm tra trạng thái completed trước khi update
    const wasBlockCompleted = existingProgress?.isCompleted || false;

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
    let updatedBlockProgress = progress.getBlockProgress(
      toObjectId(lessonId),
      toObjectId(blockId)
    );

    // Nếu đã xem hết video (maxWatchedTime = videoDuration), kiểm tra quiz
    const hasWatchedFullVideo =
      validatedMaxWatchedTime > 0 &&
      videoDuration > 0 &&
      validatedMaxWatchedTime >= videoDuration;

    if (hasWatchedFullVideo && updatedBlockProgress) {
      // Cập nhật isCompleted và isLearned dựa trên quiz
      await this._updateBlockCompletionBasedOnQuiz(
        progress,
        lessonId,
        blockId,
        userId
      );

      // Lấy lại block progress sau khi update
      await progress.save();
      updatedBlockProgress = progress.getBlockProgress(
        toObjectId(lessonId),
        toObjectId(blockId)
      );
    }

    const isBlockJustCompleted =
      !wasBlockCompleted && updatedBlockProgress?.isCompleted === true;

    // Chỉ kiểm tra lesson completion khi block vừa được completed
    if (isBlockJustCompleted) {
      await this._checkAndUpdateLessonCompletionIfNeeded(
        userId,
        pathId,
        lessonId
      );
    }

    return ResponseBuilder.success({
      message: "Video progress updated successfully",
      data: {
        isCompleted: updatedBlockProgress?.isCompleted || false,
        isLearned: hasWatchedFullVideo || updatedBlockProgress?.isCompleted || false,
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

  /**
   * Cập nhật isCompleted và isLearned dựa trên quiz khi đã xem hết video
   * @private
   * @param {Object} progress - UserProgress document
   * @param {String} lessonId - ID của lesson
   * @param {String} blockId - ID của block
   * @param {String} userId - ID của user
   */
  async _updateBlockCompletionBasedOnQuiz(progress, lessonId, blockId, userId) {
    try {
      // Lấy lesson để check block có exercise/quiz không
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      if (!lesson) {
        return;
      }

      // Tìm block trong lesson để lấy exercise (quiz)
      const blockInLesson = lesson.blocks.find(
        (b) => {
          const blockIdStr = b.block?.toString() || b.block?._id?.toString();
          return blockIdStr === blockId.toString();
        }
      );

      const hasQuiz = !!(blockInLesson && blockInLesson.exercise);

      // Lấy lesson progress
      const lessonProgress = progress.lessonProgress.find(
        (lp) => lp.lessonId.toString() === lessonId.toString()
      );

      if (!lessonProgress) {
        return;
      }

      // Lấy block progress
      const blockProgress = lessonProgress.blockProgress.find(
        (bp) => bp.blockId.toString() === blockId.toString()
      );

      if (!blockProgress) {
        return;
      }

      // Logic: Khi đã xem hết video (100%)
      // - isLearned = true (đã học - tính toán trong response, không lưu trong DB)
      // - isCompleted phụ thuộc vào quiz

      if (!hasQuiz) {
        // Không có quiz → isCompleted = true (đã học xong video)
        if (!blockProgress.isCompleted) {
          blockProgress.isCompleted = true;
          blockProgress.completedAt = new Date();
        }
      } else {
        // Có quiz → kiểm tra user đã làm quiz và pass chưa
        const passedAttempt = await QuizAttemptForBlockRepository.findPassedAttempt(
          toObjectId(userId),
          toObjectId(blockId)
        );

        const hasPassedQuiz = !!(passedAttempt && passedAttempt.isPassed);

        if (hasPassedQuiz) {
          // Đã pass quiz → isCompleted = true
          if (!blockProgress.isCompleted) {
            blockProgress.isCompleted = true;
            blockProgress.completedAt = new Date();
          }
        } else {
          // Chưa pass quiz → isCompleted = false (dù đã xem hết video)
          // Override lại logic >= 85% vì cần pass quiz mới được coi là completed
          blockProgress.isCompleted = false;
          blockProgress.completedAt = null;
        }
      }

      blockProgress.lastUpdatedAt = new Date();
    } catch (error) {
      // Log error nhưng không throw để không làm fail video heartbeat
      console.error(
        `[BlockService] Error updating block completion based on quiz for block ${blockId}:`,
        error
      );
    }
  }

  /**
   * Bắt đầu học một block - thêm block vào user progress với trạng thái chưa hoàn thành
   * @param {Object} req - Express request object
   * @param {String} req.params.blockId - ID của block
   * @param {String} req.query.learningPathId - ID của learning path (optional)
   * @param {Object} req.user - User object từ authentication middleware
   * @returns {Object} Response object
   */
  async startLearningBlock(req) {
    try {
      const { blockId } = req.params;
      const userId = req.user._id;
      const { learningPathId } = req.query;

      // Validate block tồn tại
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
        return ResponseBuilder.notFoundError("Learning path not found for user");
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

      // Kiểm tra xem block progress đã tồn tại chưa
      const existingBlockProgress = await UserProgressRepository.getBlockProgress(
        userId,
        pathId,
        lessonId,
        blockId
      );

      // Nếu đã có progress, chỉ cập nhật lastAccessedBlockId
      if (existingBlockProgress) {
        await UserProgressRepository.updateLastAccessedBlock(
          userId,
          pathId,
          lessonId,
          blockId
        );

        return ResponseBuilder.success({
          message: "Block đã được bắt đầu học trước đó",
          data: {
            blockId,
            lessonId,
            learningPathId: pathId,
            isCompleted: existingBlockProgress.isCompleted || false,
            maxWatchedTime: existingBlockProgress.maxWatchedTime || 0,
            videoDuration: existingBlockProgress.videoDuration || 0,
          },
        });
      }

      // Nếu chưa có progress, tạo mới với trạng thái bắt đầu (isCompleted = false)
      // Sử dụng updateBlockProgress với maxWatchedTime = 0 để tạo block progress mới
      const progress = await UserProgressRepository.updateBlockProgress(
        userId,
        pathId,
        lessonId,
        blockId,
        0, // maxWatchedTime = 0 (chưa xem)
        0 // videoDuration = 0 (sẽ được cập nhật sau khi load video)
      );

      // Lấy block progress vừa tạo
      const newBlockProgress = progress.getBlockProgress(
        toObjectId(lessonId),
        toObjectId(blockId)
      );

      return ResponseBuilder.success({
        message: "Bắt đầu học block thành công",
        data: {
          blockId,
          lessonId,
          learningPathId: pathId,
          isCompleted: newBlockProgress?.isCompleted || false,
          maxWatchedTime: newBlockProgress?.maxWatchedTime || 0,
          videoDuration: newBlockProgress?.videoDuration || 0,
          lastAccessedAt: new Date(),
        },
      });
    } catch (error) {
      // Nếu là AppError, throw lại để middleware xử lý
      if (error instanceof AppError) {
        throw error;
      }

      // Log và throw error khác
      console.error(
        `[BlockService] Error starting learning block ${req.params.blockId}:`,
        error
      );
      throw new AppError("Failed to start learning block", 500);
    }
  }

  /**
   * Kiểm tra và cập nhật lesson completion nếu tất cả blocks đã hoàn thành
   * @private
   * @param {String} userId - ID người dùng
   * @param {String} learningPathId - ID learning path
   * @param {String} lessonId - ID lesson
   */
  async _checkAndUpdateLessonCompletionIfNeeded(
    userId,
    learningPathId,
    lessonId
  ) {
    try {
      // Lấy lesson để có tổng số blocks
      const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
      const totalBlocks = lesson?.blocks?.length || 0;

      // Chỉ check nếu lesson có blocks
      if (totalBlocks > 0) {
        const wasLessonCompleted =
          await UserProgressRepository.checkAndUpdateLessonCompletion(
            userId,
            learningPathId,
            lessonId,
            totalBlocks
          );

        if (wasLessonCompleted) {
          console.log(
            `[BlockService] Lesson ${lessonId} marked as completed for user ${userId}`
          );
        }
      }
    } catch (error) {
      // Log error nhưng không throw để không làm fail video heartbeat
      console.error(
        `[BlockService] Error checking lesson completion for lesson ${lessonId}:`,
        error
      );
    }
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
