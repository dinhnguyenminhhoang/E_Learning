"use strict";

const { createFlashcardSchema, updateFlashcardSchema } = require("../utils/validate/flashCard");

function validateCreateFlashcard(req, res, next) {
  const { error } = createFlashcardSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  next();
}

function validateUpdateFlashcard(req, res, next) {
  const { error } = updateFlashcardSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  next();
}

module.exports = { validateCreateFlashcard, validateUpdateFlashcard };
