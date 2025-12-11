const ResponseBuilder = require("../types/response/baseResponse");
const BlockRepository = require("../repositories/block.repo");
const LessonRepository = require("../repositories/lesson.repo");
const AppError = require("../utils/appError");
const { toObjectId } = require("./idHelper");
class LessonBlockHelper {
  async deleteBlockFromLesson(blockId) {
    const lessons = await LessonRepository.getLessonsByBlockId(
      toObjectId(blockId)
    );
    await Promise.all(
      lessons.map((lesson) =>
        LessonRepository.removeBlockFromLesson(lesson._id, blockId)
      )
    );
    return ResponseBuilder.success({
      message: "Block removed from lesson successfully",
    });
  }

  async existingLesson(lessonId) {
    const lesson = await LessonRepository.getLessonById(toObjectId(lessonId));
    console.log(lesson);
    if (!lesson) throw new ResponseBuilder.notFoundError("Lesson not found.");
    return lesson;
  }

  async existingBlock(blockId) {
    const block = await BlockRepository.getBlockById(toObjectId(blockId));
    if (!block) {
      throw new AppError("Block not found.", 404);
    }
    return block;
  }

  async checkOrderExists(lesson, order) {
    const orderExists = lesson.blocks.some(
      (block) => block.order === Number(order)
    );
    if (orderExists) {
      throw new AppError("Block order already exists in lesson.", 409);
    }
  }
}

module.exports = new LessonBlockHelper();
