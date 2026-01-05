"use strict";

const Joi = require("joi");
const { STATUS } = require("../../constants/status.constans");

const createCardDeckSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.max": "Title cannot exceed 150 characters",
    "any.required": "Deck title is required",
  }),

  description: Joi.string().trim().max(1000).optional(),

  target: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .default("beginner"),

  categoryId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),

  thumbnail: Joi.string().uri().optional(),

  // Classification
  tags: Joi.array().items(Joi.string().trim()),
  difficulty: Joi.string().valid("easy", "medium", "hard").default("medium"),
  isPublic: Joi.boolean().default(true),

  // Statistics (usually auto-managed)
  viewCount: Joi.number().integer().min(0).default(0),
  studyCount: Joi.number().integer().min(0).default(0),
  cardCount: Joi.number().integer().min(0).default(0),

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

const updateCardDeckSchema = Joi.object({
  title: Joi.string().trim().max(150).optional().messages({
    "string.base": "Title must be a string",
    "string.max": "Title cannot exceed 150 characters",
  }),

  description: Joi.string().trim().max(1000).optional(),

  target: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional(),

  categoryId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  thumbnail: Joi.string().uri().optional(),

  // Classification
  tags: Joi.array().items(Joi.string().trim()).optional(),
  difficulty: Joi.string().valid("easy", "medium", "hard").optional(),
  isPublic: Joi.boolean().optional(),

  // Statistics
  viewCount: Joi.number().integer().min(0).optional(),
  studyCount: Joi.number().integer().min(0).optional(),
  cardCount: Joi.number().integer().min(0).optional(),

  // Status & metadata
  status: Joi.string()
    .valid(...Object.values(STATUS))
    .optional(),
  createdBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  updatedAt: Joi.date().optional().allow(null),
  updatedBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null),

  // Legacy field for inline card updates
  cards: Joi.array()
    .items(
      Joi.object({
        front: Joi.string().trim().required(),
        back: Joi.string().trim().required(),
        _id: Joi.string().optional(),
      })
    )
    .optional(),
});

module.exports = {
  createCardDeckSchema,
  updateCardDeckSchema,
};
