const { STATUS } = require("../constants/status.constans");
const LessonRepository = require("../repositories/lesson.repo");
const QuizRepository = require("../repositories/quiz.repo");
const ResponseBuilder = require("../types/response/baseResponse");
const UserRepository = require("../repositories/user.repo");
const UserLearningPathRepository = require("../repositories/userLearningPath.repo");
const { toObjectId } = require("../helpers/idHelper");
const lessonRepo = require("../repositories/lesson.repo");
const { default: AppError } = require("../utils/appError");
const lessonBlockHelper = require("../helpers/lessonBlock.helper");
const { HTTP_STATUS } = require("../constants/httpStatus");
const blockRepo = require("../repositories/block.repo");
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

  async attachQuizToLesson(req) {
    const { lessonId, quizId, blockId } = req.body;
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    if (!lesson)
      return ResponseBuilder.error(
        "Không tìm thấy bài học.",
        HTTP_STATUS.NOT_FOUND
      );

    const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!quiz)
      return ResponseBuilder.error(
        "Không tìm thấy quiz.",
        HTTP_STATUS.NOT_FOUND
      );

    const alreadyAttached = lesson.blocks.find(
      (b) => b.exercise?.toString() === quizId
    );
    if (alreadyAttached)
      return ResponseBuilder.duplicateError(
        "Quiz đã được đính kèm vào bài học này."
      );

    if (blockId) {
      const block = lesson.blocks.find((b) => b._id?.toString() === blockId);
      if (!block)
        return ResponseBuilder.error(
          "Không tìm thấy khối trong bài học.",
          HTTP_STATUS.NOT_FOUND
        );
      block.exercise = quiz._id;
    }

    quiz.attachedTo = {
      kind: "Lesson",
      item: lesson._id,
    };
    quiz.status = STATUS.ACTIVE;
    quiz.updatedAt = new Date();

    await quiz.save();
    await lesson.save();

    return ResponseBuilder.success(
      "Quiz được đính kèm vào bài học thành công!",
      { lesson, quiz }
    );
  }

  async detachQuizFromLesson(req) {
    const { lessonId, quizId } = req.body;

    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    if (!lesson)
      return ResponseBuilder.error(
        "Không tìm thấy bài học.",
        HTTP_STATUS.NOT_FOUND
      );

    const quiz = await QuizRepository.getQuizById(toObjectId(quizId));
    if (!quiz)
      return ResponseBuilder.error(
        "Không tìm thấy quiz.",
        HTTP_STATUS.NOT_FOUND
      );

    const block = lesson.blocks.find((b) => b.exercise?.toString() === quizId);
    if (!block)
      return ResponseBuilder.error(
        "Không tìm thấy quiz đính kèm trong bài học này.",
        HTTP_STATUS.NOT_FOUND
      );

    block.exercise = null;

    quiz.status = STATUS.DRAFT;
    quiz.updatedAt = new Date();

    await quiz.save();
    await lesson.save();

    return ResponseBuilder.success("Gỡ quiz khỏi bài học thành công!", {
      lesson,
      quiz,
    });
  }

  async getAllLessons(req) {
    const lessons = await LessonRepository.getAllLessons(req);
    return ResponseBuilder.successWithPagination(
      "Lấy danh sách bài học thành công",
      lessons.lessons,
      {
        total: lessons.total,
        pageNum: lessons.pageNum,
        pageSize: lessons.pageSize,
        totalPages: lessons.totalPages,
      }
    );
  }

  async createLesson(req) {
    const lesson = {
      title: req.body.title,
      description: req.body.description,
      skill: req.body.skill,
      topic: req.body.topic,
      level: req.body.level,
      duration_minutes: req.body.duration_minutes,
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
        return ResponseBuilder.success("Tạo bài học thành công!", restored);
      }
      return ResponseBuilder.duplicateError("Tiêu đề bài học đã tồn tại");
    }

    const added = await LessonRepository.createLesson(lesson);
    return ResponseBuilder.success("Tạo bài học thành công!", added);
  }

  // get to learn
  async getLessonById(req) {
    const { lessonId, userId } = req.params;
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    const user = await UserRepository.findById(userId);

    if (!lesson || !user) {
      return ResponseBuilder.notFoundError("Không tìm thấy bài học.");
    }

    const userLearningPath = await UserLearningPathRepository.findByUserId(
      toObjectId(userId)
    );

    const blockIds = lesson.blocks.map((b) => b.block);

    const fullBlocks = await Promise.all(
      blockIds.map(async (id) => {
        const block = await blockRepo.getBlockById(id);
        return block;
      })
    );

    lesson.blocks = fullBlocks;

    const isLessonCompleted =
      userLearningPath?.progress?.completedLessons?.some(
        (id) => id.toString() === lesson._id.toString()
      );

    return ResponseBuilder.success("Lấy dữ liệu bài học thành công", {
      isLessonCompleted,
      ...lesson,
    });
  }

  async updateLesson(req) {
    const { lessonId } = req.params;
    const lessonUpdates = req.body;

    const existingLesson = await LessonRepository.getLessonById(
      toObjectId(lessonId)
    );
    if (!existingLesson) {
      return ResponseBuilder.notFoundError("Không tìm thấy bài học.");
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
      message: "Cập nhật bài học thành công",
      data: updatedLesson,
    });
  }

  async deleteLesson(req) {
    const { lessonId } = req.params;
    const existingLesson = await LessonRepository.getLessonById(
      toObjectId(lessonId)
    );
    if (!existingLesson) {
      return ResponseBuilder.notFoundError("Không tìm thấy bài học.");
    }
    await LessonRepository.deleteSoftLesson(toObjectId(lessonId));
    return ResponseBuilder.success("Xóa bài học thành công");
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
