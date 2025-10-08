const LearningPathRepository = require("../repositories/learningPath.repo");
const CardDeckRepository = require("../repositories/cardDeck.repo");
const TargetRepository = require("../repositories/target.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const { toObjectId } = require("../helpers/idHelper");
const { STATUS } = require("../constants/status.constans");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class LearningPathService {
  _findLevel(learningPath, titleLevel) {
    return learningPath.levels.find((l) => l.title === titleLevel);
  }

  _findCategoryParent(level, categoryParentId) {
    return level.categories.find(
      (c) => c.categoryId.toString() === categoryParentId
    );
  }

  _findLesson(categoryParent, categoryChildId) {
    return categoryParent.selectedDecks.find(
      (l) => l.lessonId.toString() === categoryChildId
    );
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
    categoryParentId,
    categoryChildId,
    cardDeckId,
    selectedLevel,
  }) {
    const learningPath = await LearningPathRepository.findById(learningPathId);
    if (!learningPath) return ResponseBuilder.notFoundError("Learning");

    let level = this._findLevel(learningPath, titleLevel);
    if (!level) {
      return ResponseBuilder.notFoundError("Level");
    }

    let categoryParent = this._findCategoryParent(level, categoryParentId);
    if (!categoryParent) {
      categoryParent = {
        categoryId: toObjectId(categoryParentId),
        selectedDecks: [],
      };
      level.categories.push(categoryParent);
    }

    let lesson = this._findLesson(categoryParent, categoryChildId);
    if (lesson) {
      lesson.selectedDeck = toObjectId(cardDeckId);
      lesson.selectedLevel = selectedLevel;
    } else {
      categoryParent.selectedDecks.push({
        lessonId: toObjectId(categoryChildId),
        selectedDeck: toObjectId(cardDeckId),
        selectedLevel,
      });
    }

    const updatedPath = await LearningPathRepository.save(learningPath);

    return ResponseBuilder.success("Lesson added successfully", updatedPath);
  }

  async assignLessonToPath(req) {
    const { learningPathId } = req.params;
    const { titleLevel, categoryParentId, categoryChildId, cardDeckId } =
      req.body;

    const cardDeck = await CardDeckRepository.getCardDeckById(cardDeckId);
    if (!cardDeck) {
      return ResponseBuilder.notFoundError("Card deck");
    }
    const selectedLevel = cardDeck.level;

    return await this.addLessonToLearningPath({
      learningPathId,
      titleLevel,
      categoryParentId,
      categoryChildId,
      cardDeckId,
      selectedLevel,
    });
  }

  async getAllPath() {
    const paths = await LearningPathRepository.getAllPath();
    return ResponseBuilder.success("Fetch sucessfully", paths);
  }

  async getLearningPathHierarchy(req) {
    const {
      learningPathId,
      isLevel,
      isModule,
      isLesson,
      levelOrder,
      moduleId,
    } = req.query;

    if (isLevel === "true") {
      const path =
        await LearningPathRepository.findLevelsByPath(learningPathId);
      if (!path) return ResponseBuilder.notFoundError("Learning Path");
      return ResponseBuilder.success(
        "Fetched levels successfully",
        path.levels
      );
    }

    if (isModule === "true" && levelOrder) {
      const path = await LearningPathRepository.findModulesByLevel(
        learningPathId,
        Number(levelOrder)
      );
      if (!path || !path.levels.length)
        return ResponseBuilder.notFoundError("Level");

      const modules = path.levels[0].categories.map((module) => ({
        categoryId: module.categoryId,
        selectedDeckCount: module.selectedDecks?.length ?? 0,
      }));

      return ResponseBuilder.success("Fetched modules successfully", modules);
    }

    if (isLesson === "true" && moduleId) {
      const path = await LearningPathRepository.findLessonsByModule(
        learningPathId,
        moduleId
      );

      if (!path || !path.levels?.[0]?.categories?.[0])
        return ResponseBuilder.notFoundError("Module");

      const lessons = path.levels[0].categories[0].selectedDecks.map(
        (lesson) => ({
          lessonId: lesson.lessonId,
          title: lesson.title,
          selectedDeck: lesson.selectedDeck,
          selectedLevel: lesson.selectedLevel,
        })
      );

      return ResponseBuilder.success("Fetched lessons successfully", lessons);
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
