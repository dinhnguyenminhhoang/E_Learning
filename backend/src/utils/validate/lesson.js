import Joi from "joi";
import constants from "../../constants/status.constans.js";

const { STATUS } = constants;

export const createLessonSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(255)
    .required()
    .messages({
      "string.empty": "Title is required",
      "string.max": "Title must not exceed 255 characters",
    }),

  description: Joi.string().trim().allow(null, "").optional(),

  skill: Joi.string()
    .valid("listening", "speaking", "reading", "writing")
    .required()
    .messages({
      "any.only": "Skill must be one of: listening, speaking, reading, writing",
      "any.required": "Skill is required",
    }),

  topic: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      "string.empty": "Topic is required",
      "string.max": "Topic must not exceed 100 characters",
    }),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required()
    .messages({
      "any.only": "Level must be one of: beginner, intermediate, advanced",
      "any.required": "Level is required",
    }),

  duration_minutes: Joi.number()
    .integer()
    .min(1)
    .default(30)
    .messages({
      "number.base": "Duration must be a number",
      "number.min": "Duration must be at least 1 minute",
    }),

  order: Joi.number().integer().min(0).default(0),

  categoryId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "categoryId must be a valid MongoDB ObjectId",
      "any.required": "categoryId is required",
    }),

  prerequisites: Joi.array()
    .items(
      Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .message("Each prerequisite must be a valid MongoDB ObjectId")
    )
    .default([]),

});
