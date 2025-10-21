const { STATUS } = require("../constants/status.constans");
const LessonRepository = require("../repositories/lesson.repo");
const ResponseBuilder = require("../types/response/baseResponse");
class LessonService {
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

//   async createLesson(req) {
//     const {
//       title,
//       topic,
//       skill,
//       level,
//       categoryId,
//       status = STATUS.PENDING,
//     } = req.body;
//   }
}
module.exports = new LessonService();
