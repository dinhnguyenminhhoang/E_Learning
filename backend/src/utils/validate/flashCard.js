import Joi from "joi";
import constants from "../../constants/status.constans.js";

const { STATUS } = constants;

export const createFlashcardSchema = Joi.object({
  word: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // ObjectId
    .required(),

  frontText: Joi.string().trim().required(),

  backText: Joi.string().trim().required(),

  cardDeck: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // ObjectId
    .required(),

  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .default("easy"),

  tags: Joi.array().items(Joi.string().trim()),

  isActive: Joi.boolean().default(true),

  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.ACTIVE),

  deletedAt: Joi.date().optional().allow(null),
  deletedBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // ObjectId
    .allow(null),
});

export const updateFlashcardSchema = createFlashcardSchema.fork(
  [
    "word",
    "frontText",
    "backText",
    "cardDeck",
    "difficulty",
    "tags",
    "isActive",
    "status",
    "deletedAt",
    "deletedBy",
  ],
  (schema) => schema.optional()
);
