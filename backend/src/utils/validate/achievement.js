"use strict";

const Joi = require("joi");
const { commonFields, makeFieldsOptional } = require("./common");

const createAchievementSchema = Joi.object({
  name: commonFields.name.messages({
    "any.required": "name là bắt buộc",
  }),
  type: Joi.string()
    .valid(
      "words_learned",
      "streak",
      "quiz_score",
      "sessions",
      "custom",
      "login_streak"
    )
    .required()
    .messages({
      "any.only":
        "type phải là một trong: words_learned, streak, quiz_score, sessions, custom, login_streak",
      "any.required": "type là bắt buộc",
    }),
  criteria: Joi.object({
    target: Joi.number().min(1).required().messages({
      "number.min": "target phải ít nhất là 1",
      "any.required": "target là bắt buộc",
    }),
    unit: Joi.string().required().messages({
      "any.required": "unit là bắt buộc",
      "string.empty": "unit không được để trống",
    }),
  })
    .required()
    .messages({
      "any.required": "criteria là bắt buộc",
    }),
  status: commonFields.statusWithDefault,
});

const updateAchievementSchema = makeFieldsOptional(createAchievementSchema, [
  "name",
  "type",
  "criteria",
  "status",
]).keys({
  rarity: Joi.string()
    .valid("common", "rare", "epic", "legendary")
    .optional()
    .messages({
      "any.only": "rarity phải là một trong: common, rare, epic, legendary",
    }),
});

module.exports = {
  createAchievementSchema,
  updateAchievementSchema,
};
