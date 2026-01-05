"use strict";

const Joi = require("joi");
const { commonFields, makeFieldsOptional } = require("./common");

const BLOCK_TYPE_ENUM = ["vocabulary", "grammar", "quiz", "media"];
const SKILL_ENUM = ["listening", "speaking", "reading", "writing"];
const LEVEL_ENUM = ["beginner", "intermediate", "advanced"];

const createBlockSchema = Joi.object({
  type: Joi.string()
    .valid(...BLOCK_TYPE_ENUM)
    .required()
    .messages({
      "any.only": `type phải là một trong: ${BLOCK_TYPE_ENUM.join(", ")}`,
      "any.required": "type là bắt buộc",
    }),
  title: Joi.string().trim().optional().messages({
    "string.empty": "title không được để trống",
  }),
  description: Joi.string().trim().optional(),
  skill: Joi.string()
    .valid(...SKILL_ENUM)
    .required()
    .messages({
      "any.only": `skill phải là một trong: ${SKILL_ENUM.join(", ")}`,
      "any.required": "skill là bắt buộc",
    }),
  difficulty: Joi.string()
    .valid(...LEVEL_ENUM)
    .default("beginner")
    .messages({
      "any.only": `difficulty phải là một trong: ${LEVEL_ENUM.join(", ")}`,
    }),
  lessonId: commonFields.objectId.optional().messages({
    "string.pattern.base": "lessonId phải là ObjectId hợp lệ",
  }),
  status: commonFields.statusWithDefault,
  content: Joi.string().trim().optional(),
  order: Joi.number().integer().min(0).default(0).messages({
    "number.min": "order phải ít nhất là 0",
  }),
  duration: Joi.number().integer().min(0).optional().messages({
    "number.min": "duration phải ít nhất là 0 giây",
  }),
  mediaUrl: commonFields.url.messages({
    "string.uri": "URL media phải là URL hợp lệ",
  }),
  metadata: Joi.object().optional(),
});

const updateBlockSchema = makeFieldsOptional(createBlockSchema, [
  "type",
  "skill",
  "difficulty",
  "status",
  "order",
]);

const assignBlockToLessonSchema = Joi.object({
  blockId: commonFields.objectIdRequired.messages({
    "any.required": "blockId là bắt buộc",
    "string.pattern.base": "blockId phải là ObjectId hợp lệ",
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    "number.min": "order phải ít nhất là 0",
  }),
  exerciseId: commonFields.objectId.allow(null).optional().messages({
    "string.pattern.base": "exerciseId phải là ObjectId hợp lệ",
  }),
});

module.exports = {
  createBlockSchema,
  updateBlockSchema,
  assignBlockToLessonSchema,
};
