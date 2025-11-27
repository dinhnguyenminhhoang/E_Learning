import Joi from "joi";

const KEY_REGEX = /^[A-Z0-9_]+$/;

export const createTargetSchema = Joi.object({
  name: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().max(1000).allow(null, "").optional(),
  key: Joi.string()
    .trim()
    .uppercase()
    .pattern(KEY_REGEX)
    .required()
    .messages({
      "string.pattern.base":
        "Key chỉ được chứa chữ in hoa và số, không có khoảng trắng hoặc ký tự đặc biệt.",
    }),
  tag: Joi.string().trim().max(50).required(),
});

export const updateTargetSchema = createTargetSchema;

