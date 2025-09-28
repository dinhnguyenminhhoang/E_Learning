const { createWordSchema } = require("../utils/validate/word");

function validateCreateWord(req, res, next) {
  const { error } = createWordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map(d => d.message)
    });
  }
  next();
}
module.exports = { validateCreateWord };