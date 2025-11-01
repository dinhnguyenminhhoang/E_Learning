const Joi = require("joi");
const mongoose = require("mongoose");
const { STATUS } = require("../../constants/status.constans");

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(`"${helpers.state.path.join(".")}" must be a valid ObjectId`);
  }
  return value;
};

const optionSchema = Joi.object({
  text: Joi.string().trim().required(),
  isCorrect: Joi.boolean().default(false),
});

const questionSchema = Joi.object({
  sourceType: Joi.string()
    .valid("Word", "Flashcard", "CardDeck")
    .optional(),
  sourceId: Joi.string().custom(objectIdValidator).optional(),

  type: Joi.string()
    .valid("multiple_choice", "fill_blank", "matching", "true_false")
    .required(),

  questionText: Joi.string().trim().required(),

  options: Joi.array().items(optionSchema).default([]),

  correctAnswer: Joi.string().allow(null, "").optional(),

  explanation: Joi.string().allow(null, "").optional(),

  points: Joi.number().min(0).default(1),

  tags: Joi.array().items(Joi.string().trim()).default([]),

  thumbnail: Joi.string().uri().allow(null, "").optional(),

  audio: Joi.string().uri().allow(null, "").optional(),
});

const createQuizSchema = Joi.object({
  title: Joi.string().trim().required(),

  difficulty: Joi.string()
    .valid("EASY", "MEDIUM", "HARD")
    .default("EASY"),

  attachedTo: Joi.object({
    kind: Joi.string()
      .valid("Lesson", "Module", "LearningPath")
      .required(),
    item: Joi.string().custom(objectIdValidator).required(),
  }).required(),

  questions: Joi.array().items(questionSchema).default([]),

  xpReward: Joi.number().min(0).default(50),

  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.DRAFT),

  tags: Joi.array().items(Joi.string()).optional(),
  thumbnail: Joi.string().allow(null, "").optional(),
  audio: Joi.string().allow(null, "").optional(),

});

const updateQuizSchema = Joi.object({
  title: Joi.string().trim().optional(),
  difficulty: Joi.string().valid("EASY","MEDIUM","HARD").optional(),
  attachedTo: Joi.object({
    kind: Joi.string().valid("Lesson","Module","LearningPath").optional(),
    item: Joi.string().custom(objectIdValidator).optional(),
  }).optional(),
  questions: Joi.array().items(questionSchema).optional(),
  xpReward: Joi.number().min(0).optional(),
  status: Joi.string().valid(...Object.values(STATUS)).optional(),
});

module.exports = { createQuizSchema, updateQuizSchema };
