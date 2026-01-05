"use strict";

const Joi = require("joi");
const {
  commonFields,
  skillValidator,
  difficultyValidator,
} = require("./common");

const examSectionSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "title là bắt buộc",
    "any.required": "title là bắt buộc",
  }),
  skill: skillValidator.required().messages({
    "any.required": "skill là bắt buộc",
    "any.only":
      "skill phải là một trong: reading, listening, writing, speaking, grammar, vocabulary",
  }),
  maxScore: Joi.number().min(0).required().messages({
    "number.min": "maxScore phải ít nhất là 0",
    "any.required": "maxScore là bắt buộc",
    "number.base": "maxScore phải là số",
  }),
  order: Joi.number().integer().min(1).required().messages({
    "number.min": "order phải ít nhất là 1",
    "any.required": "order là bắt buộc",
    "number.base": "order phải là số",
  }),
  quiz: commonFields.objectIdRequired.messages({
    "any.required": "quiz là bắt buộc",
    "string.pattern.base": "quiz phải là ObjectId hợp lệ",
  }),
  timeLimit: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.min": "timeLimit phải ít nhất là 0 giây",
    "number.base": "timeLimit phải là số",
  }),
});

const createExamSchema = Joi.object({
  title: commonFields.title.messages({
    "any.required": "title là bắt buộc",
  }),
  description: commonFields.description,
  status: commonFields.statusWithDefault,
  totalTimeLimit: Joi.number()
    .integer()
    .min(0)
    .allow(null)
    .optional()
    .messages({
      "number.min": "totalTimeLimit phải ít nhất là 0 giây",
    }),
  sections: Joi.array().items(examSectionSchema).min(1).required().messages({
    "array.min": "sections phải có ít nhất 1 phần",
    "any.required": "sections là bắt buộc",
  }),
  maxScore: Joi.number().min(0).required().messages({
    "number.min": "maxScore phải ít nhất là 0",
    "any.required": "maxScore là bắt buộc",
  }),
}).custom((value, helpers) => {
  const sectionTotal = value.sections.reduce(
    (sum, section) => sum + section.maxScore,
    0
  );
  if (sectionTotal !== value.maxScore) {
    return helpers.message(
      `Tổng điểm các phần thi (${sectionTotal}) phải bằng maxScore (${value.maxScore})`
    );
  }
  return value;
});

const updateExamSchema = Joi.object({
  title: commonFields.titleOptional,
  description: commonFields.description,
  status: commonFields.status,
  totalTimeLimit: Joi.number().integer().min(0).allow(null).optional(),
  sections: Joi.array().items(examSectionSchema).min(1).optional(),
  maxScore: Joi.number().min(0).optional(),
}).custom((value, helpers) => {
  if (value.sections && value.maxScore) {
    const sectionTotal = value.sections.reduce(
      (sum, section) => sum + section.maxScore,
      0
    );
    if (sectionTotal !== value.maxScore) {
      return helpers.message(
        `Tổng điểm các phần thi (${sectionTotal}) phải bằng maxScore (${value.maxScore})`
      );
    }
  }
  return value;
});

const startExamSchema = Joi.object({
});
const submitSectionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: commonFields.objectIdRequired,
        answer: Joi.alternatives()
          .try(
            Joi.string().allow(""),
            Joi.number(),
            Joi.boolean(),
            Joi.array().items(Joi.string())
          )
          .required()
          .messages({
            "any.required": "Answer là bắt buộc",
          }),
      })
    )
    .required()
    .messages({
      "any.required": "Answers là bắt buộc",
    }),
});
const completeExamSchema = Joi.object({
});

module.exports = {
  createExamSchema,
  updateExamSchema,
  startExamSchema,
  submitSectionSchema,
  completeExamSchema,
};
