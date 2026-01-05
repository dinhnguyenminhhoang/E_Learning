const Joi = require("joi");
const { commonFields } = require("./common");

const createWordSchema = Joi.object({
  word: Joi.string().trim().lowercase().required().messages({
    "string.empty": "word là bắt buộc",
    "any.required": "word là bắt buộc",
  }),
  pronunciation: Joi.string()
    .trim()
    .pattern(
      /^\/([a-zA-Zɑæʌβɓʙçɕðɖɗəɚɛɜɝɞɟʄɡɠɢʛɦɧħɥɦʜɪɨʝɟʄɭɬɫɮɯɰŋɳɲɴɔɵɸɹɺɻɽɾʀʁɹʂʃʈʧʊʋⱱʌʍɯʏʑʐʒʔʡʕʢǀǁǂǃːˌˈ‿ˌ͡.()|~-]+)\/$/
    )
    .min(3)
    .max(50)
    .optional()
    .messages({
      "string.pattern.base":
        "pronunciation phải có format hợp lệ (ví dụ: /həˈloʊ/)",
      "string.min": "pronunciation phải có ít nhất 3 ký tự",
      "string.max": "pronunciation không được vượt quá 50 ký tự",
    }),
  audio: commonFields.url.messages({
    "string.uri": "audio phải là URL hợp lệ",
  }),
  partOfSpeech: commonFields.partOfSpeechRequired.messages({
    "any.required": "partOfSpeech là bắt buộc",
    "any.only":
      "partOfSpeech phải là một trong: noun, verb, adjective, adverb, preposition, conjunction, interjection, pronoun",
  }),
  level: commonFields.levelWithDefault.messages({
    "any.only": "level phải là một trong: beginner, intermediate, advanced",
  }),
  frequency: Joi.number().integer().min(0).optional().allow(null).messages({
    "number.min": "frequency phải ít nhất là 0",
    "number.base": "frequency phải là số",
  }),
  definitions: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(),
        meaning: Joi.string().required().messages({
          "string.empty": "meaning là bắt buộc",
          "any.required": "meaning là bắt buộc",
        }),
        meaningVi: Joi.string().required().messages({
          "string.empty": "meaningVi là bắt buộc",
          "any.required": "meaningVi là bắt buộc",
        }),
        examples: Joi.array()
          .items(
            Joi.object({
              _id: Joi.string().optional(),
              sentence: Joi.string().required().messages({
                "string.empty": "sentence là bắt buộc",
                "any.required": "sentence là bắt buộc",
              }),
              translation: Joi.string().optional(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "definitions phải có ít nhất 1 định nghĩa",
      "any.required": "definitions là bắt buộc",
    }),
  synonyms: Joi.array().items(Joi.string()).optional(),
  antonyms: Joi.array().items(Joi.string()).optional(),
  relatedWords: Joi.array().items(Joi.string()).optional(),
  categories: Joi.array().items(commonFields.objectId.allow("")).optional(),
  tags: commonFields.tags,
  image: commonFields.url.messages({
    "string.uri": "image phải là URL hợp lệ",
  }),
  difficulty: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .allow(null)
    .messages({
      "number.min": "difficulty phải từ 1 đến 5",
      "number.max": "difficulty phải từ 1 đến 5",
      "number.base": "difficulty phải là số",
    }),
  isActive: Joi.boolean().default(true),
  createdBy: commonFields.objectId.optional().messages({
    "string.pattern.base": "createdBy phải là ObjectId hợp lệ",
  }),
});

const importWordSchema = Joi.object({
  word: Joi.string().trim().lowercase().required().messages({
    "string.empty": "word là bắt buộc",
    "any.required": "word là bắt buộc",
  }),
  pronunciation: Joi.string()
    .trim()
    .pattern(
      /^\/([a-zA-Zɑæʌβɓʙçɕðɖɗəɚɛɜɝɞɟʄɡɠɢʛɦɧħɥɦʜɪɨʝɟʄɭɬɫɮɯɰŋɳɲɴɔɵɸɹɺɻɽɾʀʁɹʂʃʈʧʊʋⱱʌʍɯʏʑʐʒʔʡʕʢǀǁǂǃːˌˈ‿ˌ͡.()|~-]+)\/$/
    )
    .min(3)
    .max(50)
    .optional()
    .messages({
      "string.pattern.base": "pronunciation phải có format hợp lệ",
    }),
  audio: commonFields.url.messages({
    "string.uri": "audio phải là URL hợp lệ",
  }),
  partOfSpeech: commonFields.partOfSpeechRequired.messages({
    "any.required": "partOfSpeech là bắt buộc",
    "any.only":
      "partOfSpeech phải là một trong: noun, verb, adjective, adverb, preposition, conjunction, interjection, pronoun",
  }),
  level: commonFields.levelWithDefault.messages({
    "any.only": "level phải là một trong: beginner, intermediate, advanced",
  }),
  frequency: Joi.number().integer().min(0).optional().allow(null).messages({
    "number.min": "frequency phải ít nhất là 0",
  }),
  categories: Joi.array().items(commonFields.objectId).optional(),
  tags: commonFields.tags,
  image: commonFields.url.messages({
    "string.uri": "image phải là URL hợp lệ",
  }),
  difficulty: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .allow(null)
    .messages({
      "number.min": "difficulty phải từ 1 đến 5",
      "number.max": "difficulty phải từ 1 đến 5",
    }),
  isActive: Joi.boolean().default(true),
});

module.exports = { createWordSchema, importWordSchema };
