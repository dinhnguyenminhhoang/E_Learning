const { STATUS } = require("../constants/status.constans");
const LessonRepository = require("../repositories/lesson.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const UserRepository = require("../repositories/user.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const { toObjectId } = require("../helpers/idHelper");
const lessonRepo = require("../repositories/lesson.repo");
const { default: AppError } = require("../utils/appError");
const lessonBlockHelper = require("../helpers/lessonBlock.helper");
class LessonService {
  _existingSkillInLesson(lesson, skill) {
    const skillExists = lesson.blocks.some((b) => b.skill === skill);
    if (skillExists) {
      throw new AppError(
        `Block with skill '${skill}' already exists in lesson.`,
        409
      );
    }
  }

  _existingBlockInLesson(lesson, blockId) {
    const isExisting = lesson.blocks.find(
      (b) => b.block._id.toString() === blockId
    );
    if (isExisting) {
      throw new AppError("Block already assigned to lesson.", 409);
    }
  }

  async getAllLessons(req) {
    const lessons = await LessonRepository.getAllLessons(req);
    return ResponseBuilder.successWithPagination({
      message: "Fetched all lessons successfully",
      data: lessons,
      pagination: {
        total: lessons.total,
        pageNum: lessons.pageNum,
        pageSize: lessons.pageSize,
        totalPages: lessons.totalPages,
      },
    });
  }

  async createLesson(req) {
    const lesson = {
      title: req.body.title,
      description: req.body.description,
      skill: req.body.skill,
      topic: req.body.topic,
      level: req.body.level,
      duration_minutes: req.body.duration_minutes,
      order: req.body.order,
      status: STATUS.PENDING,
      categoryId: req.body.categoryId,
      prerequisites: req.body.prerequisites || [],
    };

    const existingLesson = await LessonRepository.getLessonByTitle(
      lesson.title
    );
    if (existingLesson) {
      if (existingLesson.status === STATUS.DELETED) {
        const restored = await LessonRepository.updateLesson(
          existingLesson._id,
          lesson
        );
        return ResponseBuilder.success({
          message: "Created lesson successfully!",
          data: restored,
        });
      }
      return ResponseBuilder.duplicateError("Lesson title already exists.");
    }

    const added = await LessonRepository.createLesson(lesson);
    return ResponseBuilder.success({
      message: "Created lesson successfully!",
      data: added,
    });
  }

  // get to learn
  async getLessonById(req) {
    const { lessonId, userId } = req.params;
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    const user = await UserRepository.findById(userId);
    if (!lesson || !user) {
      return ResponseBuilder.notFound("Lesson or user not found.");
    }
    const userLearningPath = await UserLearningPathRepository.findByUserAndPath(
      toObjectId(userId),
      toObjectId(lesson.categoryId)
    );
    const isLessonCompleted =
      userLearningPath?.progress?.completedLessons?.includes(lesson.order);
    return ResponseBuilder.success({
      message: "Fetched lesson successfully",
      data: { isLessonCompleted, ...lesson },
    });
  }

  async updateLesson(req) {
    const { lessonId } = req.params;
    const lessonUpdates = req.body;

    const existingLesson = await LessonRepository.getLessonById(
      toObjectId(lessonId)
    );
    if (!existingLesson) {
      return ResponseBuilder.notFound("Lesson not found.");
    }

    if (lessonUpdates.title && lessonUpdates.title !== existingLesson.title) {
      const lessonWithSameTitle = await LessonRepository.getLessonByTitle(
        lessonUpdates.title
      );
      if (lessonWithSameTitle) {
        if (lessonWithSameTitle.status !== STATUS.DELETED) {
          return ResponseBuilder.duplicateError("Lesson");
        }
        await LessonRepository.deleteHardLesson(lessonWithSameTitle._id);
      }
    }

    const updatedLesson = await LessonRepository.updateLesson(
      lessonId,
      lessonUpdates
    );
    return ResponseBuilder.success({
      message: "Updated lesson successfully",
      data: updatedLesson,
    });
  }

  async deleteLesson(req) {
    const { lessonId } = req.params;
    const existingLesson = await LessonRepository.getLessonById(
      toObjectId(lessonId)
    );
    if (!existingLesson) {
      return ResponseBuilder.notFound("Lesson not found.");
    }
    await LessonRepository.deleteSoftLesson(toObjectId(lessonId));
    return ResponseBuilder.success("Deleted lesson successfully");
  }

  async assignBlockToLesson(req) {
    const { lessonId } = req.params;
    const { blockId, order } = req.body;

    const existingBlock = await lessonBlockHelper.existingBlock(blockId);
    const existingLesson = await lessonBlockHelper.existingLesson(lessonId);
    this._existingBlockInLesson(existingLesson, blockId);

    await lessonBlockHelper.checkOrderExists(existingLesson, order);
    await this._existingSkillInLesson(existingLesson, existingBlock.skill);

    const assigned = await lessonRepo.assignBlockToLesson(
      toObjectId(lessonId),
      toObjectId(blockId),
      order
    );
    return ResponseBuilder.success({
      message: "Block assigned to lesson successfully",
      data: assigned,
    });
  }
}
module.exports = new LessonService();
