"use strict";
const { STATUS } = require("../constants/status.constans");
const { toObjectId } = require("../helpers/idHelper");
const TargetModel = require("../models/Target");
class TargetRepository {
  async findById(targetId) {
    return await TargetModel.findOne({
      _id: toObjectId(targetId),
      status: { $ne: STATUS.DELETED },
    });
  }

  async findAllTargets(req) {
    const { pageNum = 1, pageSize = 10, search } = req.query;
    const filter = {
      status: { $ne: STATUS.DELETED },
    };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    const targets = await TargetModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const total = await TargetModel.countDocuments(filter);
    return { total, targets };
  }

  async getTargetByKey(key) {
    const target = await TargetModel.findOne({
      key: key,
      status: { $ne: STATUS.DELETED },
    });
    return target;
  }

  async create(data) {
    const target = new TargetModel(data);
    return await target.save();
  }

  async updateById(id, payload = {}) {
    return await TargetModel.findOneAndUpdate(
      {
        _id: toObjectId(id),
        status: { $ne: STATUS.DELETED },
      },
      payload,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async softDelete(id) {
    return await TargetModel.findOneAndUpdate(
      {
        _id: toObjectId(id),
        status: { $ne: STATUS.DELETED },
      },
      {
        status: STATUS.DELETED,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }
}
module.exports = new TargetRepository();
