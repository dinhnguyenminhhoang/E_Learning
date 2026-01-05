const Joi = require("joi");
const { commonFields, makeFieldsOptional } = require("./common");

const KEY_REGEX = /^[A-Z0-9_]+$/;

const createTargetSchema = Joi.object({
  name: commonFields.name.messages({
    "string.min": "name phải có ít nhất 2 ký tự",
    "string.max": "name không được vượt quá 150 ký tự",
    "any.required": "name là bắt buộc",
  }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow(null, "")
    .optional()
    .messages({
      "string.max": "description không được vượt quá 1000 ký tự",
    }),
  key: Joi.string().trim().uppercase().pattern(KEY_REGEX).required().messages({
    "string.pattern.base":
      "key chỉ được chứa chữ in hoa và số, không có khoảng trắng hoặc ký tự đặc biệt",
    "any.required": "key là bắt buộc",
    "string.empty": "key không được để trống",
  }),
});

const updateTargetSchema = makeFieldsOptional(createTargetSchema, [
  "name",
  "key",
]);

module.exports = { createTargetSchema, updateTargetSchema };
