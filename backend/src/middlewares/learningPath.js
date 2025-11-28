const {
  assignTargetToPathSchema,
} = require("../utils/validate/learningPath");

const validate =
  (schema) =>
  (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };

module.exports = {
  validateAssignTargetToPath: validate(assignTargetToPathSchema),
};



