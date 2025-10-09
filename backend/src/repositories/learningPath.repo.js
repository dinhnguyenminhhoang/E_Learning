const { STATUS } = require("../constants/status.constans");
const { toObjectId } = require("../helpers/idHelper");
const LearningPathModel = require("../models/LearningPath");
class LearningPathRepository {
  async findById(id, isFindAll = false) {
    const query = { _id: id };

    if (!isFindAll) {
      query.status = { $ne: STATUS.DELETED };
    }

    return await LearningPathModel.findOne(query).populate("target");
  }

  async addLesson(learningPathId, updatedLevels) {
    return await LearningPathModel.findByIdAndUpdate(
      learningPathId,
      { $set: { levels: updatedLevels, updatedAt: new Date() } },
      { new: true }
    );
  }

  async createLevel(learningPathId, newLevel) {
    return await LearningPathModel.findByIdAndUpdate(
      learningPathId,
      { $push: { levels: newLevel }, updatedAt: new Date() },
      { new: true }
    );
  }

  async save(learningPath) {
    return await learningPath.save();
  }

  async findByTargetId(targetId) {
    return await LearningPathModel.findOne({
      target: targetId,
    });
  }

  async clearLevels(learningPathId) {
    return await LearningPathModel.findByIdAndUpdate(
      learningPathId,
      { $set: { levels: [] } },
      { new: true }
    );
  }

  async restoreLearningPath(data, learningPathId) {
    return await LearningPathModel.findByIdAndUpdate(
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
    return await LearningPathModel.create({
      target: toObjectId(data.targetId),
      title: data.title,
      description: data.description ?? "",
      status: STATUS.PENDING,
      levels: [],
    });
  }

  async getAllPath() {
    return await LearningPathModel.find({
      status: { $ne: STATUS.DELETED },
    }).select("_id title description status");
  }

  async findLevelsByPath(learningPathId) {
    return await LearningPathModel.findById(toObjectId(learningPathId)).select(
      "levels.order levels.title levels._id"
    );
  }

  async findModulesByLevel(learningPathId, levelOrder) {
    return await LearningPathModel.findOne(
      { _id: toObjectId(learningPathId), "levels.order": levelOrder },
      { "levels.$": 1 }
    );
  }

  async findLessonsByModule(learningPathId, moduleId) {
    return await LearningPathModel.findOne(
      {
        _id: toObjectId(learningPathId),
        "levels.categories.categoryId": toObjectId(moduleId),
      },
      { "levels.categories.$": 1 }
    );
  }
  static async findByTargetIds(targetIds) {
    return LearningPath.find({ target: { $in: targetIds } }).lean();
  }
}

module.exports = new LearningPathRepository();
