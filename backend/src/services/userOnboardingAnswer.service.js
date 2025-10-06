"use strict";
const UserOnboardingAnswerRepo = require("../repositories/userOnboardingAnswer.repo");

class UserOnboardingAnswerService {
  async saveAnswers(UserId, answers) {
    await UserOnboardingAnswerRepo.deleteByUser(UserId);
    const docs = answers.map((a) => ({
      user: UserId,
      questionKey: a.questionKey,
      answer: a.selected,
    }));
    return UserOnboardingAnswerRepo.insertMany(docs);
  }

  async getAnswers(UserId) {
    return UserOnboardingAnswerRepo.getByUser(UserId);
  }
}

module.exports = new UserOnboardingAnswerService();
