const lessonService = require("../services/lesson.service");
const blockService = require("../services/block.service");
class LessonController {
  async attachQuizToLesson(req, res) {
    const attachQuizToLesson = await lessonService.attachQuizToLesson(req);
    return res.status(attachQuizToLesson.code).json(attachQuizToLesson);
  }

  async detachQuizFromLesson(req, res) {
    const detachQuizFromLesson = await lessonService.detachQuizFromLesson(req);
    return res.status(detachQuizFromLesson.code).json(detachQuizFromLesson);
  }

  async getAllLessons(req, res) {
    const lessons = await lessonService.getAllLessons(req);
    return res.status(lessons.code).json(lessons);
  }

  async createLesson(req, res) {
    const lesson = await lessonService.createLesson(req);
    return res.status(lesson.code).json(lesson);
  }

  async getLessonById(req, res) {
    const lesson = await lessonService.getLessonById(req);
    return res.status(lesson.code).json(lesson);
  }

  async deleteLesson(req, res) {
    const lesson = await lessonService.deleteLesson(req);
    return res.status(lesson.code).json(lesson);
  }

  async updateLesson(req, res) {
    const lesson = await lessonService.updateLesson(req);
    return res.status(lesson.code).json(lesson);
  }
  async createBlock(req, res) {
    const block = await blockService.createBlockContent(req);
    return res.status(block.code).json(block);
  }

  async updateBlock(req, res) {
    const block = await blockService.updateBlockContent(req);
    return res.status(block.code).json(block);
  }

  async deleteBlock(req, res) {
    const block = await blockService.deleteBlockContent(req);
    return res.status(block.code).json(block);
  }

  async assignBlockToLesson(req, res) {
    const lesson = await lessonService.assignBlockToLesson(req);
    return res.status(lesson.code).json(lesson);
  }
}
module.exports = new LessonController();
