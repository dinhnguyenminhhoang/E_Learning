const Joi = require("joi");
const { commonFields, makeFieldsOptional } = require("./common");

const levelSchema = Joi.object({
  order: Joi.number().integer().min(1).required().messages({
    "number.min": "order phải ít nhất là 1",
    "any.required": "order là bắt buộc",
    "number.base": "order phải là số",
  }),
  title: Joi.string().trim().max(150).required().messages({
    "string.empty": "title không được để trống",
    "string.max": "title không được vượt quá 150 ký tự",
    "any.required": "title là bắt buộc",
  }),
  lessons: Joi.array()
    .items(
      Joi.object({
        lesson: commonFields.objectIdRequired.messages({
          "string.pattern.base": "lesson phải là ObjectId hợp lệ",
          "any.required": "lesson là bắt buộc",
        }),
        order: Joi.number().integer().required().messages({
          "any.required": "order là bắt buộc",
          "number.base": "order phải là số",
        }),
      })
    )
    .optional(),
  finalQuiz: commonFields.objectId.optional().messages({
    "string.pattern.base": "finalQuiz phải là ObjectId hợp lệ",
  }),
});

const createLearningPathSchema = Joi.object({
  target: commonFields.objectIdRequired.messages({
    "string.pattern.base": "target phải là ObjectId hợp lệ",
    "any.required": "target là bắt buộc",
  }),
  key: Joi.string().trim().optional().messages({
    "string.empty": "key không được để trống",
  }),
  title: Joi.string().trim().max(200).required().messages({
    "string.empty": "title không được để trống",
    "string.max": "title không được vượt quá 200 ký tự",
    "any.required": "title là bắt buộc",
  }),
  description: Joi.string().trim().max(2000).optional().messages({
    "string.max": "description không được vượt quá 2000 ký tự",
  }),
  level: commonFields.level.messages({
    "any.only": "level phải là một trong: beginner, intermediate, advanced",
  }),
  thumbnail: commonFields.url.messages({
    "string.uri": "thumbnail phải là URL hợp lệ",
  }),
  levels: Joi.array().items(levelSchema).optional(),
  status: commonFields.statusWithDefault,
});

const updateLearningPathSchema = makeFieldsOptional(createLearningPathSchema, [
  "target",
  "title",
  "level",
  "status",
]);

const assignTargetToPathSchema = Joi.object({
  targetId: commonFields.objectIdRequired.messages({
    "string.pattern.base": "targetId phải là ObjectId hợp lệ",
    "any.required": "targetId là bắt buộc",
  }),
});

const addLevelSchema = levelSchema;

module.exports = {
  createLearningPathSchema,
  updateLearningPathSchema,
  assignTargetToPathSchema,
  addLevelSchema,
};
