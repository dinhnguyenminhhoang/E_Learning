const { STATUS } = require("../constants/status.constans");
const { toObjectId } = require("../helpers/idHelper");
const LearningPath = require("../models/LearningPath");
class LearningPathRepository {
  async findById(id, isFindAll = false) {
    const query = { _id: id };

    if (!isFindAll) {
      query.status = { $ne: STATUS.DELETED };
    }
    console.log("query", query);
    const path = await LearningPath.findOne(query).populate("target");
    console.log("path", path);
    return path;
  }

  /**
   * Find Learning Path by ID with full details for editing
   * Deep populates: target, lessons (with blocks), finalQuiz
   */
  async findByIdWithFullDetails(id) {
    return await LearningPath.findOne({
      _id: toObjectId(id),
      status: { $ne: STATUS.DELETED },
    })
      .populate("target")
      .populate({
        path: "levels.lessons.lesson",
        populate: {
          path: "blocks.block",
        },
      })
      .populate("levels.finalQuiz")
      .lean();
  }

  async addLesson(learningPathId, updatedLevels) {
    return await LearningPath.findByIdAndUpdate(
      learningPathId,
      { $set: { levels: updatedLevels, updatedAt: new Date() } },
      { new: true }
    );
  }

  async createLevel(learningPathId, newLevel) {
    return await LearningPath.findByIdAndUpdate(
      learningPathId,
      { $push: { levels: newLevel }, updatedAt: new Date() },
      { new: true }
    );
  }

  async save(learningPath) {
    return await learningPath.save();
  }

  async findByTargetId(targetId) {
    return await LearningPath.findOne({
      target: toObjectId(targetId),
      status: { $ne: STATUS.DELETED },
    });
  }

  async findByTitle(title) {
    return await LearningPath.findOne({
      title: title,
    }).lean();
  }

  async clearLevels(learningPathId) {
    return await LearningPath.findByIdAndUpdate(
      learningPathId,
      { $set: { levels: [] } },
      { new: true }
    );
  }

  async restoreLearningPath(data, learningPathId) {
    return await LearningPath.findByIdAndUpdate(
      learningPathId,
      {
        $set: {
          title: data.title,
          description: data.description ?? "",
          status: STATUS.PENDING,
          updatedAt: null,
          updatedBy: null,
          createdAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async createLearningPath(data) {
    return await LearningPath.create({
      target: toObjectId(data.targetId),
      title: data.title,
      description: data.description ?? "",
      status: STATUS.PENDING,
      levels: [],
    });
  }

  async getAllPath() {
    return await LearningPath.find({
      status: { $ne: STATUS.DELETED },
    })
      .populate("target")
      .populate("levels.lessons.lesson")
      .select("_id title description status level key levels target")
      .lean();
  }

  async findByFinalExam(examId) {
    return await LearningPath.findOne({
      "levels.finalQuiz": toObjectId(examId),
      status: { $ne: STATUS.DELETED },
    }).lean();
  }

  async findLevelsByPath(learningPathId) {
    return await LearningPath.findById(toObjectId(learningPathId))
      .select("levels.order levels.title levels._id")
      .lean();
  }

  async findLessonsByLevel(learningPathId, levelOrder) {
    return await LearningPath.findOne(
      { _id: toObjectId(learningPathId), "levels.order": levelOrder },
      { "levels.$": 1 }
    )
      .populate("levels.lessons.lesson")
      .lean();
  }

  async findBlocksByLesson(learningPathId, levelOrder, lessonId) {
    const path = await LearningPath.findOne(
      {
        _id: toObjectId(learningPathId),
        "levels.order": levelOrder,
      },
      { "levels.$": 1 }
    ).lean();
    console.log("path", path);

    if (!path?.levels?.length) return null;

    const level = path.levels[0];
    const lesson = level.lessons.find(
      (l) => l.lesson.toString() === lessonId.toString()
    );

    return lesson?.blocks ?? [];
  }
  static async findByTargetIds(targetIds) {
    return LearningPath.find({ target: { $in: targetIds } }).lean();
  }

  async updateLearningPath(id, updateData) {
    const updateFields = {};
    if (updateData.title) updateFields.title = updateData.title;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.level) updateFields.level = updateData.level;
    if (updateData.targetId) updateFields.target = toObjectId(updateData.targetId);

    updateFields.updatedAt = new Date();

    return await LearningPath.findByIdAndUpdate(
      toObjectId(id),
      { $set: updateFields },
      { new: true }
    ).populate("target");
  }

  async softDelete(id) {
    return await LearningPath.findByIdAndUpdate(
      toObjectId(id),
      { $set: { status: STATUS.DELETED, updatedAt: new Date() } },
      { new: true }
    );
  }
}

module.exports = new LearningPathRepository();
