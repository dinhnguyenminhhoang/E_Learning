"use strict";

const Joi = require("joi");
const { commonFields } = require("./common");

const submitAnswersSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: commonFields.objectIdRequired.messages({
          "any.required": "questionId là bắt buộc cho mỗi câu trả lời",
          "string.pattern.base": "questionId phải là ObjectId hợp lệ",
        }),
        answer: Joi.alternatives()
          .try(
            Joi.string().trim(),
            Joi.number(),
            Joi.boolean(),
            Joi.array().items(Joi.string().trim())
          )
          .required()
          .messages({
            "any.required": "answer là bắt buộc cho mỗi câu hỏi",
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

module.exports = {
  submitAnswersSchema,
};
