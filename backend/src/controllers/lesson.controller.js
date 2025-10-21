const lessonService = require("../services/lesson.service");

class LessonController {
  async getAllLessons(req, res) {
    const lessons = await lessonService.getAllLessons(req);
    return res.status(lessons.code).json(lessons);
  }
}
module.exports = new LessonController();
