"use strict";
const { STATUS } = require("../constants/status.constans");
const TargetModel = require("../models/Target");
class TargetRepository {
  async findById(targetId) {
    const target =  await TargetModel.findOne({
      _id: targetId,
      status: { $ne: STATUS.DELETED },
    });
    return target;
  }
}
module.exports = new TargetRepository();
