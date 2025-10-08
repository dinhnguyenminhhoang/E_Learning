"use strict";
const { STATUS } = require("../constants/status.constans");
const TargetModel = require("../models/Target");
class TargetRepository {
  async findById(targetId) {
    return await TargetModel.findOne({
      _id: targetId,
      status: { $ne: STATUS.DELETED },
    });
  }
}
module.exports = new TargetRepository();
