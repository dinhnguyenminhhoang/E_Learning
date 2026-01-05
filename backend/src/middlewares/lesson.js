const { createValidator } = require("../utils/validate/common");
const { createLessonSchema } = require("../utils/validate/lesson");

module.exports = {
  validateCreateLesson: createValidator(createLessonSchema),
};
