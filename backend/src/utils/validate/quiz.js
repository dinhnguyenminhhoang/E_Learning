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

// Default option schema – requires non-empty text
const optionSchema = Joi.object({
  text: Joi.string().trim().required(),
  isCorrect: Joi.boolean().default(false),
});

// For writing questions, options are optional/placeholder so text can be empty
const writingOptionSchema = Joi.object({
  text: Joi.string().allow("").optional(),
  isCorrect: Joi.boolean().default(false),
});
const matchingPairSchema = Joi.object({
  left: Joi.string().trim().required(),
  right: Joi.string().trim().required(),
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
      .min(1) // Bắt buộc phải có ít nhất 1 cặp
      .required()
      .messages({
        "array.min": "Matching questions must have at least 1 pair",
        "any.required": "Matching pairs are required for matching questions",
      }),
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
  // attachedTo: Joi.object({
  //   kind: Joi.string().valid("Lesson", "Module", "LearningPath").optional(),
  //   item: Joi.string().custom(objectIdValidator).optional(),
  // }).optional(),
  questions: Joi.array().items(questionSchema).optional(),
  xpReward: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid(...Object.values(STATUS))
    .optional(),
});



module.exports = { createQuizSchema, updateQuizSchema, addQuestionsSchema };
