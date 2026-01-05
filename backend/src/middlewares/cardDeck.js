"use strict";

const { createValidator } = require("../utils/validate/common");
const {
  createCardDeckSchema,
  updateCardDeckSchema,
} = require("../utils/validate/cardDeck");

module.exports = {
  validateCreateCardDeck: createValidator(createCardDeckSchema),
  validateUpdateCardDeck: createValidator(updateCardDeckSchema),
};
