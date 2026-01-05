const Joi = require("joi");
const mongoose = require("mongoose");
const { STATUS } = require("../../constants/status.constans");

const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(
      `"${helpers.state.path.join(".")}" must be a valid ObjectId`
    );
  }
  return value;
};

const optionSchema = Joi.object({
  text: Joi.string().trim().required(),
  isCorrect: Joi.boolean().default(false),
});

const writingOptionSchema = Joi.object({
  text: Joi.string().allow("").optional(),
  isCorrect: Joi.boolean().default(false),
});
const matchingItemSchema = Joi.object({
  text: Joi.string().trim().required(),
  // id có thể optional vì backend tự sinh
  id: Joi.string().optional().allow(null, ""), 
});

// ✅ SỬA LẠI: Định nghĩa Schema cho cặp Left - Right là Object
const matchingPairSchema = Joi.object({
  left: matchingItemSchema.required(),
  right: matchingItemSchema.required(),
});

const questionSchema = Joi.object({
  sourceType: Joi.string().valid("Word", "Flashcard", "CardDeck").optional(),
  sourceId: Joi.string().custom(objectIdValidator).optional(),

  type: Joi.string()
    .valid(
      "multiple_choice",
      "fill_blank",
      "matching",
      "true_false",
      "writing",
      "speaking"
    )
    .required(),

  questionText: Joi.string().trim().required(),

  options: Joi.when("type", {
    is: "writing",
    then: Joi.array().items(writingOptionSchema).default([]),
    otherwise: Joi.array().items(optionSchema).default([]),
  }),

  matchingPairs: Joi.when("type", {
    is: "matching",
    then: Joi.array()
      .items(matchingPairSchema)
      .min(1)
      .required(),
    otherwise: Joi.array().items(matchingPairSchema).default([]).optional(),
  }).optional(),

  correctAnswer: Joi.string().allow(null, "").optional(),

  explanation: Joi.string().allow(null, "").optional(),

  points: Joi.number().min(0).default(1),

  tags: Joi.array().items(Joi.string().trim()).default([]),

  thumbnail: Joi.string().uri().allow(null, "").optional(),

  audio: Joi.string().uri().allow(null, "").optional(),
});


const createQuizSchema = Joi.object({
  title: Joi.string().trim().required(),

  skill: Joi.string()
    .valid(
      "reading",
      "listening",
      "writing",
      "speaking",
      "grammar",
      "vocabulary"
    )
    .required(),

  difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD").default("EASY"),

  questions: Joi.array().items(questionSchema).default([]),

  xpReward: Joi.number().min(0).default(50),

  status: Joi.string()
    .valid(...Object.values(STATUS))
    .default(STATUS.DRAFT),

  tags: Joi.array().items(Joi.string()).optional(),
  thumbnail: Joi.string().allow(null, "").optional(),
  audio: Joi.string().allow(null, "").optional(),
});

const addQuestionsSchema = Joi.object({
  questions: Joi.array().items(questionSchema).min(1).required(),
});

const updateQuizSchema = Joi.object({
  title: Joi.string().trim().optional(),
  skill: Joi.string()
    .valid(
      "reading",
      "listening",
      "writing",
      "speaking",
      "grammar",
      "vocabulary"
    )
    .optional(),
  difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD").optional(),
  questions: Joi.array().items(questionSchema).optional(),
  xpReward: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(...Object.values(STATUS))
    .optional(),
});



module.exports = { createQuizSchema, updateQuizSchema, addQuestionsSchema };
