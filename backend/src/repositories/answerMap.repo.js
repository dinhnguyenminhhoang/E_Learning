"use strict";

const { STATUS } = require("../constants/status.constans");
const AnswerMap = require("../models/AnswerMap");

class AnswerMapRepo {
  async findMappedTargetByAnswer(answer) {
    if (!answer || !answer.answerKeys || answer.answerKeys.length === 0)
      return null;

    let rawValue;

    if (answer.questionKey.toUpperCase() === "LEVEL") {
      // Với LEVEL, chỉ lấy phần tử đầu tiên
      rawValue = answer.answerKeys[0]?.toUpperCase();
    } else {
      // Với các key khác, bạn có thể join nhiều giá trị hoặc lấy cả mảng
      rawValue = answer.answerKeys.map((v) => v.toUpperCase());
    }

    const query = {
      questionKey: answer.questionKey.toUpperCase(),
      status: STATUS.ACTIVE,
    };
    console.log("raw value", rawValue);
    if (Array.isArray(rawValue)) {
      query.rawValue = { $in: rawValue };
    } else {
      query.rawValue = rawValue;
    }

    console.log("query", query);

    const mapping = await AnswerMap.findOne(query)
      .populate("target")
      .populate("learningPath");

    return mapping;
  }
}

module.exports = new AnswerMapRepo();
