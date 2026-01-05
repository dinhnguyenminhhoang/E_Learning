"use strict";

const Joi = require("joi");
const { STATUS } = require("../../constants/status.constans");

const objectIdValidator = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid ObjectId",
  });

const urlValidator = Joi.string().uri().messages({
  "string.uri": "{{#label}} must be a valid URL",
});

const emailValidator = Joi.string().email().lowercase().trim().messages({
  "string.email": "{{#label}} must be a valid email address",
});

const phoneValidator = Joi.string()
  .pattern(/^(\+84|84|0)[3-9]\d{8}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid Vietnamese phone number",
  });

const dateValidator = Joi.alternatives()
  .try(Joi.date(), Joi.string().isoDate())
  .messages({
    "alternatives.match": "{{#label}} must be a valid date",
  });

const statusValidator = Joi.string()
  .valid(...Object.values(STATUS))
  .messages({
    "any.only": `{{#label}} must be one of: ${Object.values(STATUS).join(", ")}`,
  });

const levelValidator = Joi.string()
  .valid("beginner", "intermediate", "advanced")
  .lowercase()
  .messages({
    "any.only": "{{#label}} must be one of: beginner, intermediate, advanced",
  });

const skillValidator = Joi.string()
  .valid("reading", "listening", "writing", "speaking")
  .lowercase()
  .messages({
    "any.only":
      "{{#label}} must be one of: reading, listening, writing, speaking, grammar, vocabulary",
  });

const difficultyValidator = Joi.string()
  .valid("EASY", "MEDIUM", "HARD")
  .uppercase()
  .messages({
    "any.only": "{{#label}} must be one of: EASY, MEDIUM, HARD",
  });

const partOfSpeechValidator = Joi.string()
  .valid(
    "noun",
    "verb",
    "adjective",
    "adverb",
    "preposition",
    "conjunction",
    "interjection",
    "pronoun"
  )
  .lowercase()
  .messages({
    "any.only":
      "{{#label}} must be one of: noun, verb, adjective, adverb, preposition, conjunction, interjection, pronoun",
  });

function formatValidationErrors(error) {
  if (!error || !error.details) return [];

  return error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message.replace(/"/g, ""),
    type: detail.type,
  }));
}

function createValidator(schema, property = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = formatValidationErrors(error);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req[property] = value;
    next();
  };
}

function makeFieldsOptional(schema, fieldNames) {
  return schema.fork(fieldNames, (field) => field.optional());
}

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().optional(),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

const commonFields = {
  objectId: objectIdValidator,
  objectIdRequired: objectIdValidator.required(),
  url: urlValidator,
  urlRequired: urlValidator.required(),
  email: emailValidator,
  emailRequired: emailValidator.required(),
  phone: phoneValidator,
  phoneOptional: phoneValidator.allow("", null).optional(),
  date: dateValidator,
  status: statusValidator,
  statusWithDefault: statusValidator.default(STATUS.ACTIVE),
  level: levelValidator,
  levelWithDefault: levelValidator.default("beginner"),
  skill: skillValidator,
  skillRequired: skillValidator.required(),
  difficulty: difficultyValidator,
  difficultyWithDefault: difficultyValidator.default("EASY"),
  partOfSpeech: partOfSpeechValidator,
  partOfSpeechRequired: partOfSpeechValidator.required(),

  title: Joi.string().trim().max(200).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title cannot exceed 200 characters",
  }),
  titleOptional: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  name: Joi.string().trim().min(2).max(150).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 150 characters",
  }),
  nameOptional: Joi.string().trim().min(2).max(150).optional(),

  positiveNumber: Joi.number().min(0),
  positiveInteger: Joi.number().integer().min(0),
  score: Joi.number().min(0).max(100),
  xpReward: Joi.number().integer().min(0).default(0),

  tags: Joi.array().items(Joi.string().trim()).default([]),

  updatedBy: Joi.string().optional().allow(null),
  updatedAt: Joi.date().optional().allow(null),
};
module.exports = {
  objectIdValidator,
  urlValidator,
  emailValidator,
  phoneValidator,
  dateValidator,
  statusValidator,
  levelValidator,
  skillValidator,
  difficultyValidator,
  partOfSpeechValidator,
  formatValidationErrors,
  createValidator,
  makeFieldsOptional,
  paginationSchema,
  commonFields,
};
