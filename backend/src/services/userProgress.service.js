"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const UserProgressRepository = require("../repositories/userProgress.repo");
const LessonRepository = require("../repositories/lesson.repo");
const { toObjectId } = require("../helpers/idHelper");

class UserProgressService {
  /**
   * Lấy progress của một lesson (bao gồm tất cả block progress)
   */
  async getLessonProgress(req) {
    const { lessonId } = req.params;
    const userId = req.user._id;
    const { learningPathId } = req.query;

    // Lấy learningPathId (từ query hoặc từ userLearningPath đầu tiên)
    let pathId = learningPathId;
    if (!pathId) {
      const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      return ResponseBuilder.success({
        message: "Fetched lesson progress successfully",
        data: {
          lessonId,
          isCompleted: false,
          blockProgress: [],
          currentBlockId: null,
          progressPercentage: 0,
        },
      });
    }

    // Lấy lesson để có danh sách blocks và order
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    if (!lesson) {
      return ResponseBuilder.notFoundError("Lesson not found");
    }

    // Lấy lesson progress từ UserProgress
    const lessonProgress = await UserProgressRepository.getLessonProgress(
      userId,
      pathId,
      lessonId
    );

    // Tính toán current block và progress percentage
    const blocks = lesson.blocks || [];
    const totalBlocks = blocks.length;

    // Tạo map để check block nào đã completed
    const completedBlockMap = new Map();
    if (lessonProgress?.blockProgress) {
      lessonProgress.blockProgress.forEach((bp) => {
        if (bp.isCompleted) {
          completedBlockMap.set(bp.blockId.toString(), true);
        }
      });
    }

    // Tìm current block: block đầu tiên chưa completed (theo order)
    let currentBlockId = null;
    let currentBlockIndex = -1;
    if (totalBlocks > 0) {
      // Sort blocks theo order
      const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

      for (let i = 0; i < sortedBlocks.length; i++) {
        const blockId = sortedBlocks[i].block?.toString() || sortedBlocks[i].block;
        if (!completedBlockMap.get(blockId)) {
          currentBlockId = blockId;
          currentBlockIndex = i;
          break;
        }
      }
    }

    // Tính progress percentage
    const completedCount = completedBlockMap.size;
    const progressPercentage =
      totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;

    // Tính progress chi tiết cho từng block
    const blockProgressDetails = blocks.map((blockItem, index) => {
      const blockId = blockItem.block?.toString() || blockItem.block;
      const blockProgress = lessonProgress?.blockProgress?.find(
        (bp) => bp.blockId.toString() === blockId
      );

      // Tính progress percentage cho block (nếu là video)
      let blockProgressPercentage = 0;
      if (blockProgress && blockProgress.videoDuration > 0) {
        blockProgressPercentage = Math.round(
          (blockProgress.maxWatchedTime / blockProgress.videoDuration) * 100
        );
      }

      return {
        blockId,
        order: blockItem.order || index,
        isCompleted: blockProgress?.isCompleted || false,
        maxWatchedTime: blockProgress?.maxWatchedTime || 0,
        videoDuration: blockProgress?.videoDuration || 0,
        progressPercentage: blockProgressPercentage,
        isCurrentBlock: blockId === currentBlockId,
      };
    });

    // Sort theo order
    blockProgressDetails.sort((a, b) => a.order - b.order);

    // Lấy lastAccessedBlockId (block user đang xem - có thể là block cũ)
    const lastAccessedBlockId = lessonProgress?.lastAccessedBlockId
      ? lessonProgress.lastAccessedBlockId.toString()
      : null;

    return ResponseBuilder.success({
      message: "Fetched lesson progress successfully",
      data: {
        lessonId,
        isCompleted: lessonProgress?.isCompleted || false,
        currentBlockId, // Block đầu tiên chưa completed (để biết tiến độ)
        currentBlockIndex, // Index của current block
        lastAccessedBlockId, // Block user đang xem (có thể là block cũ đã completed)
        progressPercentage, // Progress của lesson (%)
        totalBlocks,
        completedBlocks: completedCount,
        blockProgress: blockProgressDetails, // Chi tiết progress từng block
      },
    });
  }

  /**
   * Lấy danh sách các block đã hoàn thành trong lesson
   */
  async getCompletedBlocksInLesson(req) {
    const { lessonId } = req.params;
    const userId = req.user._id;
    const { learningPathId } = req.query;
    console.log("Getting completed blocks for lesson:", lessonId, "user:", userId);
    let pathId = learningPathId;
    if (!pathId) {
      const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      return ResponseBuilder.success({
        message: "Fetched completed blocks successfully",
        data: [],
      });
    }

    const lessonProgress = await UserProgressRepository.getLessonProgress(
      userId,
      pathId,
      lessonId
    );

    const completedBlocks =
      lessonProgress?.blockProgress
        ?.filter((bp) => bp.isCompleted)
        .map((bp) => bp.blockId) || [];

    return ResponseBuilder.success({
      message: "Fetched completed blocks successfully",
      data: completedBlocks,
    });
  }

  /**
   * Lấy current block trong lesson (block đang học hoặc block tiếp theo)
   * Logic:
   * - Nếu có block chưa completed → trả về block đầu tiên chưa completed
   * - Nếu tất cả block đã completed → trả về null (lesson completed)
   * - Nếu chưa có progress nào → trả về block đầu tiên trong lesson
   */
  async getCurrentBlockInLesson(req) {
    const { lessonId } = req.params;
    const userId = req.user._id;
    const { learningPathId } = req.query;

    // Lấy learningPathId
    let pathId = learningPathId;
    if (!pathId) {
      const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      return ResponseBuilder.success({
        message: "Fetched current block successfully",
        data: {
          currentBlockId: null,
          isLessonCompleted: false,
        },
      });
    }

    // Lấy lesson để có danh sách blocks
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    if (!lesson) {
      return ResponseBuilder.notFoundError("Lesson not found");
    }

    const blocks = lesson.blocks || [];
    if (blocks.length === 0) {
      return ResponseBuilder.success({
        message: "Fetched current block successfully",
        data: {
          currentBlockId: null,
          isLessonCompleted: false,
        },
      });
    }

    // Lấy lesson progress
    const lessonProgress = await UserProgressRepository.getLessonProgress(
      userId,
      pathId,
      lessonId
    );

    // Tạo map để check block nào đã completed
    const completedBlockMap = new Map();
    if (lessonProgress?.blockProgress) {
      lessonProgress.blockProgress.forEach((bp) => {
        if (bp.isCompleted) {
          completedBlockMap.set(bp.blockId.toString(), true);
        }
      });
    }

    // Sort blocks theo order
    const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Tìm current block: block đầu tiên chưa completed
    let currentBlockId = null;
    let currentBlockIndex = -1;
    let nextBlockId = null;

    for (let i = 0; i < sortedBlocks.length; i++) {
      const blockId = sortedBlocks[i].block?.toString() || sortedBlocks[i].block;
      const isCompleted = completedBlockMap.get(blockId);

      if (!isCompleted) {
        if (currentBlockId === null) {
          currentBlockId = blockId;
          currentBlockIndex = i;
        }
        if (nextBlockId === null && i > 0) {
          // Block tiếp theo (nếu có)
          nextBlockId = blockId;
        }
      }
    }

    // Nếu tất cả block đã completed
    const isLessonCompleted = lessonProgress?.isCompleted || false;
    if (currentBlockId === null && sortedBlocks.length > 0) {
      // Tất cả đã completed → không có current block
      return ResponseBuilder.success({
        message: "Fetched current block successfully",
        data: {
          currentBlockId: null,
          currentBlockIndex: -1,
          nextBlockId: null,
          isLessonCompleted: true,
          message: "All blocks in this lesson are completed",
        },
      });
    }

    // Nếu chưa có current block (chưa bắt đầu học)
    if (currentBlockId === null && sortedBlocks.length > 0) {
      currentBlockId = sortedBlocks[0].block?.toString() || sortedBlocks[0].block;
      currentBlockIndex = 0;
    }

    return ResponseBuilder.success({
      message: "Fetched current block successfully",
      data: {
        currentBlockId,
        currentBlockIndex,
        nextBlockId,
        isLessonCompleted,
        totalBlocks: sortedBlocks.length,
        completedBlocks: completedBlockMap.size,
      },
    });
  }

  /**
   * Đánh dấu block là "đang xem" (cho phép học lại block cũ)
   * Khi user chọn xem một block (kể cả block đã completed), cập nhật lastAccessedBlockId
   */
  async markBlockAsAccessing(req) {
    const { lessonId, blockId } = req.params;
    const userId = req.user._id;
    const { learningPathId } = req.query;

    // Lấy learningPathId
    let pathId = learningPathId;
    if (!pathId) {
      const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
      const userPaths = await UserLearningPathRepository.findByUserId(
        toObjectId(userId)
      );
      if (userPaths && userPaths.length > 0) {
        pathId = userPaths[0].learningPath.toString();
      }
    }

    if (!pathId) {
      return ResponseBuilder.error("Learning path not found", 404);
    }

    // Validate block thuộc lesson
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    if (!lesson) {
      return ResponseBuilder.notFoundError("Lesson not found");
    }

    const blockExists = lesson.blocks.some(
      (b) =>
        (b.block?.toString() || b.block) === blockId ||
        b.block?.toString() === blockId
    );

    if (!blockExists) {
      return ResponseBuilder.error("Block not found in this lesson", 404);
    }

    // Cập nhật lastAccessedBlockId
    await UserProgressRepository.updateLastAccessedBlock(
      userId,
      pathId,
      lessonId,
      blockId
    );

    return ResponseBuilder.success({
      message: "Block marked as accessing successfully",
      data: {
        lessonId,
        blockId,
        lastAccessedAt: new Date(),
      },
    });
  }
}

module.exports = new UserProgressService();
