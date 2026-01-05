const { createValidator } = require("../utils/validate/common");
const {
  createLearningPathSchema,
  updateLearningPathSchema,
  assignTargetToPathSchema,
  addLevelSchema,
} = require("../utils/validate/learningPath");

module.exports = {
  validateCreateLearningPath: createValidator(createLearningPathSchema),
  validateUpdateLearningPath: createValidator(updateLearningPathSchema),
  validateAssignTargetToPath: createValidator(assignTargetToPathSchema),
  validateAddLevel: createValidator(addLevelSchema),
};
