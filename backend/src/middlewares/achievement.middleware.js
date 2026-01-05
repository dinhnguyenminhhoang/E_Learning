"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  createAchievementSchema,
  updateAchievementSchema,
} = require("../utils/validate/achievement");

module.exports = {
  validateCreateAchievement: createValidator(createAchievementSchema),
  validateUpdateAchievement: createValidator(updateAchievementSchema),
};
