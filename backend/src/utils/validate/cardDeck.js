"use strict";

const Joi = require("joi");
const {
  commonFields,
  levelValidator,
  statusValidator,
  makeFieldsOptional,
} = require("./common");
const { STATUS } = require("../../constants/status.constans");

const createCardDeckSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    "string.base": "title phải là chuỗi ký tự",
    "string.empty": "title không được để trống",
    "string.max": "title không được vượt quá 150 ký tự",
    "any.required": "title bộ thẻ là bắt buộc",
  }),

  description: Joi.string().trim().max(1000).optional(),

  // target: Joi.string()
  //   .regex(/^[0-9a-fA-F]{24}$/)
  //   .required()
  //   .messages({
  //     "string.pattern.base": "Target must be a valid ObjectId",
  //     "any.required": "Target is required",
  //   }),

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

const updateCardDeckSchema = makeFieldsOptional(createCardDeckSchema, [
  "title",
  "level",
  "categoryId",
  "status",
]);

module.exports = {
  createCardDeckSchema,
  updateCardDeckSchema,
};
