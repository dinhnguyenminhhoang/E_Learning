const LearningPathRepository = require("../repositories/learningPath.repo");
const QuizRepository = require("../repositories/quiz.repo");
const TargetRepository = require("../repositories/target.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { STATUS } = require("../constants/status.constans");
const RESPONSE_MESSAGES = require("../constants/responseMessage");
const userLearningPathRepo = require("../repositories/userLearningPath.repo");

class LearningPathService {
  _findLevel(learningPath, titleLevel) {
    return learningPath.levels.find((l) => l.title === titleLevel);
  }

  _findLesson(level, lessonId) {
    return level.lessons.find((c) => c.lesson.toString() === lessonId);
  }

  static async getPathsByTargets(targetIds) {
    const paths = LearningPathRepo.findByTargetIds(targetIds);
    return ResponseBuilder.success(RESPONSE_MESSAGES.SUCCESS.FETCHED, paths);
  }

  async attachQuizToLevel(req) {
    const { learningPathId, levelOrder, quizId } = req.body;

    const learningPath = await LearningPathRepository.findById(
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

    const learningPath = await LearningPathRepository.findById(
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
    const learningPath = await LearningPathRepository.findById(
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
      toObjectId(data.targetId),
      true
    );

    if (!existingTarget) {
      return ResponseBuilder.notFoundError("Không tìm thấy mục tiêu.");
    }

    const existingPath = await LearningPathRepository.findByTargetId(
      toObjectId(data.targetId)
    );
    if (existingPath) {
      if (existingPath.status === STATUS.DELETED) {
        await LearningPathRepository.clearLevels(existingPath._id);
        const restored = await LearningPathRepository.restoreLearningPath(
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

    const added = await LearningPathRepository.createLearningPath(data);

    return ResponseBuilder.success("Tao lộ trình học thành công!", added);
  }

  async addLessonToLearningPath({
    learningPathId,
    titleLevel,
    lessonId,
    order,
  }) {
    const learningPath = await LearningPathRepository.findById(learningPathId);
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
    const updatedPath = await LearningPathRepository.save(learningPath);

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
    const paths = await LearningPathRepository.getAllPath();
    return ResponseBuilder.success("Lấy danh sách lộ trình thành công", paths);
  }

  async getLearningPathHierarchy(req) {
    const { learningPathId, isLevel, isLesson, isBlock, levelOrder, lessonId } =
      req.query;

    if (isLevel === "true") {
      const path =
        await LearningPathRepository.findLevelsByPath(learningPathId);
      if (!path)
        return ResponseBuilder.notFoundError("Không tìm thấy lộ trình.");
      return ResponseBuilder.success(
        "lấy dữ liệu cấp độ thành công",
        path.levels
      );
    }

    if (isLesson === "true" && levelOrder) {
      const path = await LearningPathRepository.findLessonsByLevel(
        learningPathId,
        Number(levelOrder)
      );
      console.log("path", path.levels[0].lessons);
      if (!path || !path.levels.length)
        return ResponseBuilder.notFoundError("Không tìm thấy cấp độ.");

      const userLearningPath = await userLearningPathRepo.findByUserAndPath(
        req.user._id,
        toObjectId(learningPathId)
      );

      console.log("userLearningPath", userLearningPath);

      const lessons = path.levels[0].lessons
        .filter((module) => module.lesson)
        .map((module) => ({
          lesson: module.lesson._id,
          order: module.order ?? 0,
          title: module.lesson.title ?? "",
        }));

      return ResponseBuilder.success("Lấy dữ liệu bài học thành công", lessons);
    }

    if (isBlock === "true" && lessonId) {
      const blocks = await LearningPathRepository.findBlocksByLesson(
        learningPathId,
        Number(levelOrder),
        lessonId
      );

      console.log("blocks", blocks);
      if (!blocks || !blocks.length)
        return ResponseBuilder.notFoundError("Không tìm thấy blocks.");

      return ResponseBuilder.success("Lấy blocks thành công", blocks);
    }

    return ResponseBuilder.badRequest("Invalid query parameters");
  }

  async addNewLevelToPath(req) {
    const { learningPathId } = req.params;
    const { title } = req.body;
    const existingPath = await LearningPathRepository.findById(
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
    const updatedPath = await LearningPathRepository.createLevel(
      learningPathId,
      newLevel
    );

    return ResponseBuilder.success("Thêm cấp độ thành công", updatedPath);
  }
}

module.exports = new LearningPathService();
