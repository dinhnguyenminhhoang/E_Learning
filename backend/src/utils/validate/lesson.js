const Joi = require("joi");
const { commonFields } = require("./common");

const createLessonSchema = Joi.object({
  title: Joi.string().trim().max(255).required().messages({
    "string.empty": "title là bắt buộc",
    "string.max": "title không vượt 255 ký tự",
    "any.required": "title là bắt buộc",
  }),
  description: Joi.string().trim().allow(null, "").optional(),
  skill: commonFields.skillRequired.messages({
    "any.only": "skill phải một trong: listening, speaking, reading, writing",
    "any.required": "skill là bắt buộc",
  }),
  topic: Joi.string().trim().max(100).required().messages({
    "string.empty": "topic là bắt buộc",
    "string.max": "topic không vượt 100 ký tự",
    "any.required": "topic là bắt buộc",
  }),
  level: commonFields.level.messages({
    "any.only": "level phải một trong: beginner, intermediate, advanced",
    "any.required": "level là bắt buộc",
  }),
  duration_minutes: Joi.number().integer().min(1).default(30).messages({
    "number.base": "duration_minutes phải là số",
    "number.min": "duration_minutes phải ít nhất 1 phút",
  }),
  categoryId: commonFields.objectIdRequired.messages({
    "string.pattern.base": "categoryId phải là một ObjectId hợp lệ",
    "any.required": "categoryId là bắt buộc",
  }),
  prerequisites: Joi.array()
    .items(
      commonFields.objectId.messages({
        "string.pattern.base": "prerequisites phải là một ObjectId hợp lệ",
      })
    )
    .default([]),
});

module.exports = { createLessonSchema };
