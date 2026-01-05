"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  createExamSchema,
  updateExamSchema,
  startExamSchema,
  submitSectionSchema,
  completeExamSchema,
} = require("../utils/validate/exam");

module.exports = {
  validateCreateExam: createValidator(createExamSchema),
  validateUpdateExam: createValidator(updateExamSchema),
  validateStartExam: createValidator(startExamSchema),
  validateSubmitSection: createValidator(submitSectionSchema),
  validateCompleteExam: createValidator(completeExamSchema),
};
