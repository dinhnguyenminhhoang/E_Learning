const { createQuizSchema, updateQuizSchema } = require("../utils/validate/quiz");

function validateCreateQuiz(req, res, next) {
  const { error } = createQuizSchema.validate(req.body, {
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

function validateUpdateQuiz(req, res, next) {
  const { error, value } = updateQuizSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      details: error.details,
    });
  }

  req.body = value;
  next();
}


module.exports = { validateCreateQuiz, validateUpdateQuiz };
