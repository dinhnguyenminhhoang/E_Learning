"use strict";

const Joi = require("joi");
const { commonFields } = require("./common");

const updateProgressSchema = Joi.object({
  lessonId: commonFields.objectId.optional().messages({
    "string.pattern.base": "lessonId phải là ObjectId hợp lệ",
  }),
  blockId: commonFields.objectId.optional().messages({
    "string.pattern.base": "blockId phải là ObjectId hợp lệ",
  }),
  score: Joi.number().min(0).max(100).optional().messages({
    "number.min": "score phải ít nhất là 0",
    "number.max": "score không được vượt quá 100",
  }),
});

const completeBlockSchema = Joi.object({
  blockId: commonFields.objectIdRequired.messages({
    "any.required": "blockId là bắt buộc",
    "string.pattern.base": "blockId phải là ObjectId hợp lệ",
  }),
  lessonId: commonFields.objectIdRequired.messages({
    "any.required": "lessonId là bắt buộc",
    "string.pattern.base": "lessonId phải là ObjectId hợp lệ",
  }),
  score: Joi.number().min(0).max(100).optional().messages({
    "number.min": "score phải ít nhất là 0",
    "number.max": "score không được vượt quá 100",
  }),
  timeSpent: Joi.number().integer().min(0).optional().messages({
    "number.min": "timeSpent phải ít nhất là 0 giây",
  }),
});

const updateLessonProgressSchema = Joi.object({
  lessonId: commonFields.objectIdRequired.messages({
    "any.required": "lessonId là bắt buộc",
    "string.pattern.base": "lessonId phải là ObjectId hợp lệ",
  }),
});

module.exports = {
  updateProgressSchema,
  completeBlockSchema,
  updateLessonProgressSchema,
};
