const lessonService = require("../services/lesson.service");
const blockService = require("../services/block.service");
const blockRepo = require("../repositories/block.repo");
const ResponseBuilder = require("../types/response/baseResponse");
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
    const result = await lessonService.getAllLessons(req);
    res.status(result.code).json(result);
  }

  async getAllBlocks(req, res) {
    const filters = {
      type: req.query.type,
      skill: req.query.skill,
      difficulty: req.query.difficulty,
      status: req.query.status,
      lessonId: req.query.lessonId,
      search: req.query.search,
    };
    const pagination = {
      pageNum: parseInt(req.query.pageNum) || 1,
      pageSize: parseInt(req.query.pageSize) || 20,
    };

    const result = await blockRepo.getAllBlocks(filters, pagination);
    const response = ResponseBuilder.successWithPagination(
      "Lấy danh sách blocks thành công",
      result.blocks,
      {
        pageNum: result.pageNum,
        pageSize: result.pageSize,
        total: result.total,
      }
    );
    res.status(response.code).json(response);
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
  async getBlockById(req, res) {
    const block = await blockService.getBlockById(req);
    return res.status(block.code).json(block);
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

  async getDetailForEdit(req, res) {
    const lesson = await lessonService.getDetailForEdit(req);
    return res.status(lesson.code).json(lesson);
  }
}
module.exports = new LessonController();
