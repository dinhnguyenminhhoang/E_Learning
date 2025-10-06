"use strict";

const UserOnboardingAnswer = require("../models/UserOnboardingAnswer");

class UserOnboardingAnswerRepo {
  async insertMany(data) {
    return UserOnboardingAnswer.insertMany(data);
  }

  async deleteByUser(UserId) {
    return UserOnboardingAnswer.deleteMany({ user: UserId });
  }

  async getByUser(UserId) {
    return UserOnboardingAnswer.find({ user: UserId }).lean();
  }
}

module.exports = new UserOnboardingAnswerRepo();
