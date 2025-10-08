"use strict";

const UserOnboardingAnswer = require("../models/UserOnboardingAnswer");

class UserOnboardingAnswerRepo {
  async insertMany(data) {
    const inserted = await UserOnboardingAnswer.insertMany(data);
    return inserted.map((doc) => ({
      id: doc._id,
      questionKey: doc.questionKey,
      answerKeys: doc.answerKeys,
    }));
  }

  async deleteByUser(UserId) {
    return UserOnboardingAnswer.deleteMany({ user: UserId });
  }

  async getByUser(UserId) {
    return UserOnboardingAnswer.find({ user: UserId }).lean();
  }
}

module.exports = new UserOnboardingAnswerRepo();
