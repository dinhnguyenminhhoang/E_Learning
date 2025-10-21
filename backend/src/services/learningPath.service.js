const LearningPathRepository = require("../repositories/learningPath.repo");
const TargetRepository = require("../repositories/target.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { STATUS } = require("../constants/status.constans");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

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

  async createNewPath(req) {
    const data = req.body;
    const existingTarget = await TargetRepository.findById(
      toObjectId(data.targetId),
      true
    );

    if (!existingTarget) {
      return ResponseBuilder.notFoundError("Target");
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
          "Learning path creted sucessfully!",
          restored
        );
      }
      return ResponseBuilder.duplicateError();
    }

    const added = await LearningPathRepository.createLearningPath(data);

    return ResponseBuilder.success("Learning path creted sucessfully!", added);
  }

  async addLessonToLearningPath({
    learningPathId,
    titleLevel,
    lessonId,
    order,
  }) {
    const learningPath = await LearningPathRepository.findById(learningPathId);
    if (!learningPath) return ResponseBuilder.notFoundError("Learning");

    let level = this._findLevel(learningPath, titleLevel);
    if (!level) {
      return ResponseBuilder.notFoundError("Level");
    }

    let lesson = this._findLesson(level, lessonId);
    if (lesson) {
      return ResponseBuilder.duplicateError("Lesson is existing in path!");
    }
    const addingLesson = {
      lesson: toObjectId(lessonId),
      order: order ?? 0,
    };
    level.lessons.push(addingLesson);
    const updatedPath = await LearningPathRepository.save(learningPath);

    return ResponseBuilder.success("Lesson added successfully", updatedPath);
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
    return ResponseBuilder.success("Fetch sucessfully", paths);
  }

  async getLearningPathHierarchy(req) {
    const { learningPathId, isLevel, isLesson, isBlock, levelOrder, lessonId } =
      req.query;

    if (isLevel === "true") {
      const path =
        await LearningPathRepository.findLevelsByPath(learningPathId);
      if (!path) return ResponseBuilder.notFoundError("Learning Path");
      return ResponseBuilder.success(
        "Fetched levels successfully",
        path.levels
      );
    }

    if (isLesson === "true" && levelOrder) {
      const path = await LearningPathRepository.findLessonsByLevel(
        learningPathId,
        Number(levelOrder)
      );
      if (!path || !path.levels.length)
        return ResponseBuilder.notFoundError("Level");

      const lessons = path.levels[0].lessons.map((module) => ({
        lesson: module.lesson,
        order: module.order ?? 0,
        title: lesson.title ?? "",
      }));

      return ResponseBuilder.success("Fetched lessons successfully", lessons);
    }

    if (isBlock === "true" && lessonId) {
      const path = await LearningPathRepository.findBlocksByLesson(
        learningPathId,
        Number(levelOrder),
        lessonId
      );

      if (!blocks || !blocks.length)
        return ResponseBuilder.notFoundError("Lesson");

      return ResponseBuilder.success("Fetched blocks successfully", blocks);
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
      return ResponseBuilder.notFoundError("Learning Path");
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

    return ResponseBuilder.success("Level added successfully", updatedPath);
  }
}

module.exports = new LearningPathService();
