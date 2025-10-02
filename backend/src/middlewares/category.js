const { createCategorySchema } = require("../utils/validate/category");

function validateCreateCategory(req, res, next) {
  const { error } = createCategorySchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  next();
}

module.exports = { validateCreateCategory };
