"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  updateProgressSchema,
  completeBlockSchema,
  updateLessonProgressSchema,
} = require("../utils/validate/userProgress");

module.exports = {
  validateUpdateProgress: createValidator(updateProgressSchema),
  validateCompleteBlock: createValidator(completeBlockSchema),
  validateUpdateLessonProgress: createValidator(updateLessonProgressSchema),
};
