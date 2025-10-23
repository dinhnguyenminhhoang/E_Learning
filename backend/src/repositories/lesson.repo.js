const { STATUS } = require("../constants/status.constans");
const { toObjectId } = require("../helpers/idHelper");
const Lesson = require("../models/Lessson");

class LessonRepository {
  async getAllLessons(req) {
    const {
      pageNum = 1,
      pageSize = 10,
      skill,
      level,
      categoryId,
      search,
    } = req.query;

    const filter = { status: { $ne: `${STATUS.DELETED}` } };
    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (categoryId) {
      const categoryObjectId = toObjectId(categoryId);
      if (categoryObjectId) {
        filter.categoryId = categoryObjectId;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (pageNum - 1) * pageSize;
    const limit = parseInt(pageSize);

    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lesson.countDocuments(filter),
    ]);

    return {
      total,
      pageNum: parseInt(pageNum),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize),
      lessons,
    };
  }

  async getLessonById(lessonId) {
    const lesson = await Lesson.findById(lessonId).populate("blocks.block");
    return lesson;
  }

  async createLesson(lessonData) {
    const lesson = new Lesson(lessonData);
    return lesson.save();
  }

  async updateLesson(lessonId, updateData) {
    const updated = await Lesson.findByIdAndUpdate(
      lessonId,
      { $set: updateData },
      { new: true }
    );
    return updated;
  }
  async getLessonByTitle(title) {
    return Lesson.findOne({ title: title });
  }

  async deleteHardLesson(lessonId) {
    return Lesson.findByIdAndDelete(lessonId);
  }

  async deleteSoftLesson(lessonId) {
    return Lesson.findByIdAndUpdate(
      lessonId,
      { status: STATUS.DELETED },
      { new: true }
    );
  }
}
module.exports = new LessonRepository();
