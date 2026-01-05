"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  startQuizAttemptSchema,
  submitAnswerSchema,
  submitQuizAttemptSchema,
  completeQuizAttemptSchema,
} = require("../utils/validate/quizAttempt");

module.exports = {
  validateStartQuizAttempt: createValidator(startQuizAttemptSchema),
  validateSubmitAnswer: createValidator(submitAnswerSchema),
  validateSubmitQuizAttempt: createValidator(submitQuizAttemptSchema),
  validateCompleteQuizAttempt: createValidator(completeQuizAttemptSchema),
};
