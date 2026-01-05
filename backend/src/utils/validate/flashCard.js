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

  // Media fields
  images: Joi.array().items(Joi.string().uri().trim()),
  audio: Joi.string().uri().trim(),
  hint: Joi.string().trim().max(500),
  explanation: Joi.string().trim().max(1000),

  // Statistics (usually auto-managed, but allow in schema)
  viewCount: Joi.number().integer().min(0).default(0),
  studyCount: Joi.number().integer().min(0).default(0),

  // Status & metadata
  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.ACTIVE),
  createdBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
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
    "images",
    "audio",
    "hint",
    "explanation",
    "viewCount",
    "studyCount",
    "status",
    "createdBy",
    "updatedAt",
    "updatedBy",
  ],
  (schema) => schema.optional()
);

module.exports = { createFlashcardSchema, updateFlashcardSchema };
