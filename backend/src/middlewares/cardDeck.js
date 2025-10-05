import { createCardDeckSchema, updateCardDeckSchema } from "../utils/validate/cardDeck.js";

export function validateCreateCardDeck(req, res, next) {
  const { error } = createCardDeckSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  next();
}

export function validateUpdateCardDeck(req, res, next) {
  const { error } = updateCardDeckSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      error: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  next();
}
