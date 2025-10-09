const Joi = require("joi");
const { STATUS } = require("../../constants/status.constans");

const createFlashcardSchema = Joi.object({
  word: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  frontText: Joi.string().trim().required(),
  backText: Joi.string().trim().required(),
  cardDeck: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  difficulty: Joi.string().valid("easy", "medium", "hard").default("easy"),
  tags: Joi.array().items(Joi.string().trim()),
  status: Joi.boolean().default(true),
  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.ACTIVE),
  updatedAt: Joi.date().optional().allow(null),
  updatedBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .allow(null),
});

const updateFlashcardSchema = createFlashcardSchema.fork(
  [
    "word",
    "frontText",
    "backText",
    "cardDeck",
    "difficulty",
    "tags",
    "status",
    "status",
    "updatedAt",
    "updatedBy",
  ],
  (schema) => schema.optional()
);

module.exports = { createFlashcardSchema, updateFlashcardSchema };
