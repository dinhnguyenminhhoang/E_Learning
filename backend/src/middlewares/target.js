const { createValidator } = require("../utils/validate/common");
const {
  createTargetSchema,
  updateTargetSchema,
} = require("../utils/validate/target");

module.exports = {
  validateCreateTarget: createValidator(createTargetSchema),
  validateUpdateTarget: createValidator(updateTargetSchema),
};
