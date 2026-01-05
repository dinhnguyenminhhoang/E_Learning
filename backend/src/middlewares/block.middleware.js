"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  createBlockSchema,
  updateBlockSchema,
  assignBlockToLessonSchema,
} = require("../utils/validate/block");

module.exports = {
  validateCreateBlock: createValidator(createBlockSchema),
  validateUpdateBlock: createValidator(updateBlockSchema),
  validateAssignBlock: createValidator(assignBlockToLessonSchema),
};
