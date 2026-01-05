"use strict";

const Joi = require("joi");
const { commonFields } = require("./common");

const startQuizAttemptSchema = Joi.object({
  quizId: commonFields.objectIdRequired.messages({
    "any.required": "quizId là bắt buộc",
    "string.pattern.base": "quizId phải là ObjectId hợp lệ",
  }),
  blockId: commonFields.objectId.optional().messages({
    "string.pattern.base": "blockId phải là ObjectId hợp lệ",
  }),
  lessonId: commonFields.objectId.optional().messages({
    "string.pattern.base": "lessonId phải là ObjectId hợp lệ",
  }),
});

const submitAnswerSchema = Joi.object({
  questionId: commonFields.objectIdRequired.messages({
    "any.required": "questionId là bắt buộc",
    "string.pattern.base": "questionId phải là ObjectId hợp lệ",
  }),
  answer: Joi.alternatives()
    .try(
      Joi.string().allow(""),
      Joi.number(),
      Joi.boolean(),
      Joi.array().items(Joi.string())
    )
    .required()
    .messages({
      "any.required": "answer là bắt buộc",
    }),
  timeSpent: Joi.number().integer().min(0).optional().messages({
    "number.min": "timeSpent phải ít nhất là 0 giây",
  }),
});

const submitQuizAttemptSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: commonFields.objectIdRequired.messages({
          "any.required": "questionId là bắt buộc",
          "string.pattern.base": "questionId phải là ObjectId hợp lệ",
        }),
        answer: Joi.alternatives()
          .try(
            Joi.string().allow(""),
            Joi.number(),
            Joi.boolean(),
            Joi.array().items(Joi.string())
          )
          .required()
          .messages({
            "any.required": "answer là bắt buộc",
          }),
        timeSpent: Joi.number().integer().min(0).optional().messages({
          "number.min": "timeSpent phải ít nhất là 0 giây",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "answers phải có ít nhất một câu trả lời",
      "any.required": "answers là bắt buộc",
      "array.base": "answers phải là mảng",
    }),
});

const completeQuizAttemptSchema = Joi.object({
});

module.exports = {
  startQuizAttemptSchema,
  submitAnswerSchema,
  submitQuizAttemptSchema,
  completeQuizAttemptSchema,
};
