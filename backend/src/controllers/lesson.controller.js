const lessonService = require("../services/lesson.service");

class LessonController {
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
}
module.exports = new LessonController();
