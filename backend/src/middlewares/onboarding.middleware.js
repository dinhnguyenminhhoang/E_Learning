"use strict";

const { createValidator } = require("../utils/validate/common");
const { submitAnswersSchema } = require("../utils/validate/onboarding");

module.exports = {
  validateSubmitAnswers: createValidator(submitAnswersSchema),
};
