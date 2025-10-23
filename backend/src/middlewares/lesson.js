const { createLessonSchema } = require("../utils/validate/lesson");

function validateCreateLesson(req, res, next) {
  const { error } = createLessonSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details,
    });
  }
  next();
}

module.exports = { validateCreateLesson };
