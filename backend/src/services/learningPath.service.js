const learningPathRepo = require("../repositories/learningPath.repo");
const QuizRepository = require("../repositories/quiz.repo");
const TargetRepository = require("../repositories/target.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { STATUS } = require("../constants/status.constans");
const RESPONSE_MESSAGES = require("../constants/responseMessage");
const blockRepo = require("../repositories/block.repo");
const userLearningPathRepo = require("../repositories/userLearningPath.repo");
const UserProgressRepository = require("../repositories/userProgress.repo");

class LearningPathService {
  _findLevel(learningPath, titleLevel) {
    return learningPath.levels.find((l) => l.title === titleLevel);
  }

  _findLesson(level, lessonId) {
    return level.lessons.find((c) => c.lesson.toString() === lessonId);
  }

  static async getPathsByTargets(targetIds) {
    const paths = learningPathRepo.findByTargetIds(targetIds);
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, paths);
  }

  async attachQuizToLevel(req) {
    const { learningPathId, levelOrder, quizId } = req.body;

    const learningPath = await learningPathRepo.findById(
      toObjectId(learningPathId)
    );
    if (!learningPath) {
      return ResponseBuilder.notFoundError("Không tìm thấy lộ trình học.");
    }

    const level = learningPath.levels.find(
      (lvl) => lvl.order === Number(levelOrder)
    );
    if (!level) {
      return ResponseBuilder.notFoundError("Không tìm thấy cấp độ.");
    }

    const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!quiz) {
      return ResponseBuilder.notFoundError("Không tìm thấy quiz.");
    }

    level.finalQuiz = quiz._id;

    quiz.attachedTo = { kind: "LearningPath", item: learningPath._id };
    await quiz.save();

    await learningPath.save();

    return ResponseBuilder.success({
      message: `Gắn quiz vào ${levelOrder} thành công.`,
      data: learningPath,
    });
  }

  async updateQuizInLevel(req) {
    const { learningPathId, levelOrder, newQuizId } = req.body;

    const learningPath = await learningPathRepo.findById(
      toObjectId(learningPathId)
    );
    if (!learningPath) {
      return ResponseBuilder.notFoundError("Không tìm thấy lộ trình học.");
    }

    const level = learningPath.levels.find(
      (lvl) => lvl.order === Number(levelOrder)
    );
    if (!level) {
      return ResponseBuilder.notFoundError("Không tìm thấy cấp độ.");
    }

    const quiz = await QuizRepository.getQuizById(toObjectId(newQuizId));
    if (!quiz) {
      return ResponseBuilder.notFoundError("Không tìm thấy quiz.");
    }

    level.finalQuiz = quiz._id;

    quiz.attachedTo = { kind: "LearningPath", item: learningPath._id };
    await quiz.save();

    await learningPath.save();

    return ResponseBuilder.success({
      message: `Cập nhật ${levelOrder} thành công.`,
      data: learningPath,
    });
  }

  async removeQuizFromLevel(req) {
    const { learningPathId, levelOrder } = req.body;
    const learningPath = await learningPathRepo.findById(
      toObjectId(learningPathId)
    );
    if (!learningPath) {
      return ResponseBuilder.notFoundError("Không tìm thấy lộ trình học.");
    }

    const level = learningPath.levels.find(
      (lvl) => lvl.order === Number(levelOrder)
    );
    if (!level) {
      return ResponseBuilder.notFoundError("Không tìm thấy cấp độ.");
    }

    if (!level.finalQuiz) {
      return ResponseBuilder.badRequest("Không có quiz nào gắn cho level này.");
    }

    level.finalQuiz = null;
    await learningPath.save();

    return ResponseBuilder.success({
      message: `Xóa quiz khỏi cấp độ ${levelOrder} thành công.`,
      data: learningPath,
    });
  }

  async createNewPath(req) {
    const data = req.body;
    const existingTarget = await TargetRepository.findById(
      toObjectId(data.targetId)
    );

    if (!existingTarget) {
      return ResponseBuilder.notFoundError("Không tìm thấy mục tiêu.");
    }

    const existingPath = await learningPathRepo.findByTargetId(
      toObjectId(data.targetId)
    );
    if (existingPath) {
      if (existingPath.status === STATUS.DELETED) {
        await learningPathRepo.clearLevels(existingPath._id);
        const restored = await learningPathRepo.restoreLearningPath(
          data,
          existingPath._id
        );
        return ResponseBuilder.success(
          "Tạo lộ trình học thành công!",
          restored
        );
      }
      return ResponseBuilder.duplicateError();
    }

    const added = await learningPathRepo.createLearningPath(data);

    return ResponseBuilder.success("Tao lộ trình học thành công!", added);
  }

  async addLessonToLearningPath({
    learningPathId,
    titleLevel,
    lessonId,
    order,
  }) {
    const learningPath = await learningPathRepo.findById(learningPathId);
    if (!learningPath)
      return ResponseBuilder.notFoundError("Không tìm thấy lộ trình học.");

    let level = this._findLevel(learningPath, titleLevel);
    if (!level) {
      return ResponseBuilder.notFoundError("Không tìm thấy cấp độ.");
    }

    let lesson = this._findLesson(level, lessonId);
    if (lesson) {
      return ResponseBuilder.duplicateError(
        "Bài học đã tồn tại trong lộ tình!"
      );
    }
    const addingLesson = {
      lesson: toObjectId(lessonId),
      order: order ?? 0,
    };
    level.lessons.push(addingLesson);
    const updatedPath = await learningPathRepo.save(learningPath);

    return ResponseBuilder.success("Gắn bài học thành công", updatedPath);
  }

  async assignLessonToPath(req) {
    const { learningPathId } = req.params;
    const { titleLevel, lessonId, order } = req.body;
    return await this.addLessonToLearningPath({
      learningPathId,
      titleLevel,
      lessonId,
      order,
    });
  }

  async getAllPath() {
    const paths = await learningPathRepo.getAllPath();
    return ResponseBuilder.success("Lấy danh sách lộ trình thành công", paths);
  }

  async getLearningPathHierarchy(req) {
    const { learningPathId, isLevel, isLesson, isBlock, levelOrder, lessonId } =
      req.query;
    if (isLevel === "true") {
      const path = await learningPathRepo.findLevelsByPath(
        toObjectId(learningPathId)
      );
      if (!path)
        return ResponseBuilder.notFoundError("Không tìm thấy lộ trình.");
      return ResponseBuilder.success(
        "lấy dữ liệu cấp độ thành công",
        path.levels
      );
    }

    if (isLesson === "true" && levelOrder) {
      const path = await learningPathRepo.findLessonsByLevel(
        learningPathId,
        Number(levelOrder)
      );
      if (!path || !path.levels.length)
        return ResponseBuilder.notFoundError("Không tìm thấy cấp độ.");

      // Lấy user progress để kiểm tra bài nào đã học
      const userProgress = await UserProgressRepository.findByUserAndPath(
        req.user._id,
        toObjectId(learningPathId)
      );

      // Tạo Map để tra cứu nhanh lesson progress (lessonId -> isCompleted)
      const lessonProgressMap = new Map();
      if (userProgress && userProgress.lessonProgress) {
        userProgress.lessonProgress.forEach((lp) => {
          const lessonIdStr = lp.lessonId.toString();
          lessonProgressMap.set(lessonIdStr, {
            isCompleted: lp.isCompleted || false,
            lastAccessedAt: lp.lastAccessedAt || null,
            completedAt: lp.completedAt || null,
          });
        });
      }

      const lessons = path.levels[0].lessons
        .filter((module) => module.lesson)
        .map((module) => {
          const lessonIdStr = module.lesson._id.toString();
          const progress = lessonProgressMap.get(lessonIdStr);
          
          return {
            lesson: module.lesson._id,
            order: module.order ?? 0,
            title: module.lesson.title ?? "",
            isCompleted: progress?.isCompleted || false,
            isLearned: progress?.isCompleted || false, // Alias cho dễ hiểu
            lastAccessedAt: progress?.lastAccessedAt || null,
            completedAt: progress?.completedAt || null,
          };
        });

      // Đếm số lesson đã hoàn thành
      const completedLessonsCount = lessons.filter(
        (lesson) => lesson.isCompleted === true
      ).length;

      return ResponseBuilder.success("Lấy dữ liệu bài học thành công", {
        lessons: lessons,
        totalLessons: lessons.length,
        completedLessons: completedLessonsCount,
      });
    }

    if (isBlock === "true" && lessonId) {
      const blocks = await blockRepo.getBlocksByLesson(lessonId);
      if (!blocks || !blocks.length)
        return ResponseBuilder.notFoundError("Không tìm thấy blocks.");

      // Lấy learningPathId (từ query hoặc từ userLearningPath đầu tiên)
      let pathId = learningPathId;
      if (!pathId) {
        const userPaths = await userLearningPathRepo.findByUserId(
          toObjectId(req.user._id)
        );
        if (userPaths && userPaths.length > 0) {
          pathId = userPaths[0].learningPath.toString();
        }
      }

      // Lấy user progress để kiểm tra block nào đã học
      let userProgress = null;
      if (pathId) {
        userProgress = await UserProgressRepository.findByUserAndPath(
          req.user._id,
          toObjectId(pathId)
        );
      }

      // Lấy lesson progress cho lesson này
      let lessonProgress = null;
      if (userProgress) {
        lessonProgress = userProgress.getLessonProgress(toObjectId(lessonId));
      }

      // Tạo Map để tra cứu nhanh block progress (blockId -> progress info)
      const blockProgressMap = new Map();
      if (lessonProgress && lessonProgress.blockProgress) {
        lessonProgress.blockProgress.forEach((bp) => {
          const blockIdStr = bp.blockId.toString();
          blockProgressMap.set(blockIdStr, {
            isCompleted: bp.isCompleted || false,
            maxWatchedTime: bp.maxWatchedTime || 0,
            videoDuration: bp.videoDuration || 0,
            completedAt: bp.completedAt || null,
            lastUpdatedAt: bp.lastUpdatedAt || null,
          });
        });
      }

      // Map blocks với progress
      const blocksWithProgress = blocks.map((block) => {
        // Block từ ContentBlock sẽ có _id
        const blockId = block._id?.toString();
        const progress = blockId ? blockProgressMap.get(blockId) : null;

        // Tính progress percentage cho block (nếu là video)
        let progressPercentage = 0;
        if (progress && progress.videoDuration > 0) {
          progressPercentage = Math.round(
            (progress.maxWatchedTime / progress.videoDuration) * 100
          );
        }

        return {
          ...block.toObject ? block.toObject() : block, // Convert Mongoose document to plain object
          isCompleted: progress?.isCompleted || false,
          isLearned: progress?.isCompleted || false, // Alias cho dễ hiểu
          maxWatchedTime: progress?.maxWatchedTime || 0,
          videoDuration: progress?.videoDuration || 0,
          progressPercentage: progressPercentage,
          completedAt: progress?.completedAt || null,
          lastUpdatedAt: progress?.lastUpdatedAt || null,
        };
      });

      // Đếm số block đã hoàn thành
      const completedBlocksCount = blocksWithProgress.filter(
        (block) => block.isCompleted === true
      ).length;

      return ResponseBuilder.success("Lấy blocks thành công", {
        blocks: blocksWithProgress,
        totalBlocks: blocksWithProgress.length,
        completedBlocks: completedBlocksCount,
      });
    }

    return ResponseBuilder.badRequest("Invalid query parameters");
  }

  async addNewLevelToPath(req) {
    const { learningPathId } = req.params;
    const { title } = req.body;
    const existingPath = await learningPathRepo.findById(
      toObjectId(learningPathId)
    );

    if (!existingPath) {
      return ResponseBuilder.notFoundError("Không tìm thấy lộ trình học.");
    }

    const isDuplicate = existingPath.levels?.some(
      (lvl) => lvl.title.toLowerCase().trim() === title.toLowerCase().trim()
    );

    if (isDuplicate) {
      return ResponseBuilder.badRequest(
        "Level title already exists in this path"
      );
    }
    const lastOrder = existingPath.levels?.length
      ? Math.max(...existingPath.levels.map((lvl) => lvl.order))
      : 0;

    const newLevel = {
      order: lastOrder + 1,
      title: title?.trim() || `Level ${lastOrder + 1}`,
      categories: [],
    };
    const updatedPath = await learningPathRepo.createLevel(
      learningPathId,
      newLevel
    );

    return ResponseBuilder.success("Thêm cấp độ thành công", updatedPath);
  }

  async assignTargetToLearningPath(req) {
    const { learningPathId } = req.params;
    const { targetId } = req.body;

    if (!learningPathId) {
      return ResponseBuilder.badRequest("Thiếu learningPathId.");
    }

    const learningPath = await learningPathRepo.findById(
      toObjectId(learningPathId)
    );
    if (!learningPath) {
      return ResponseBuilder.notFoundError("Không tìm thấy lộ trình học.");
    }

    const target = await TargetRepository.findById(toObjectId(targetId));
    if (!target) {
      return ResponseBuilder.notFoundError("Không tìm thấy mục tiêu.");
    }

    const existingPathForTarget = await learningPathRepo.findByTargetId(
      toObjectId(targetId)
    );

    if (
      existingPathForTarget &&
      existingPathForTarget._id.toString() !== learningPathId
    ) {
      return ResponseBuilder.badRequest(
        "Mục tiêu này đã được gán cho một lộ trình khác."
      );
    }

    learningPath.target = toObjectId(targetId);
    await learningPath.save();

    const updatedPath = await learningPathRepo.findById(learningPath._id);

    return ResponseBuilder.success(
      "Gán mục tiêu cho lộ trình thành công.",
      updatedPath
    );
  }
}

module.exports = new LearningPathService();
