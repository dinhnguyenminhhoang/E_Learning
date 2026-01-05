const Joi = require("joi");
const { commonFields, makeFieldsOptional } = require("./common");

const createFlashcardSchema = Joi.object({
  word: commonFields.objectIdRequired.messages({
    "string.pattern.base": "word phải là ObjectId hợp lệ",
    "any.required": "word là bắt buộc",
    "string.empty": "word không được để trống",
  }),
  frontText: Joi.string().trim().required().messages({
    "string.empty": "frontText không được để trống",
    "any.required": "frontText là bắt buộc",
  }),
  backText: Joi.string().trim().required().messages({
    "string.empty": "backText không được để trống",
    "any.required": "backText là bắt buộc",
  }),
  cardDeck: commonFields.objectIdRequired.messages({
    "string.pattern.base": "cardDeck phải là ObjectId hợp lệ",
    "any.required": "cardDeck là bắt buộc",
    "string.empty": "cardDeck không được để trống",
  }),
  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .default("easy")
    .messages({
      "any.only": "difficulty phải là một trong: easy, medium, hard",
    }),
  tags: commonFields.tags,
  status: commonFields.statusWithDefault.messages({
    "any.only": "status phải là một trong: active, inactive, deleted",
  }),
});

const updateFlashcardSchema = makeFieldsOptional(createFlashcardSchema, [
  "word",
  "frontText",
  "backText",
  "cardDeck",
  "difficulty",
  "status",
]);

module.exports = { createFlashcardSchema, updateFlashcardSchema };
