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
    .required()
    .messages({
      "string.pattern.base": "Target must be a valid ObjectId",
      "any.required": "Target is required",
    }),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .default("beginner"),

  categoryId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),

  thumbnail: Joi.string().uri().optional(),

  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.ACTIVE),
});

const updateCardDeckSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    "string.base": "Title must be a string",
    "string.empty": "Title is required",
    "string.max": "Title cannot exceed 150 characters",
    "any.required": "Deck title is required",
  }),

  description: Joi.string().trim().max(1000).optional(),

  target: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Target must be a valid ObjectId",
      "any.required": "Target is required",
    }),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .default("beginner"),

  thumbnail: Joi.string().uri().optional(),

  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.ACTIVE),
});

module.exports = {
  createCardDeckSchema,
  updateCardDeckSchema,
};
