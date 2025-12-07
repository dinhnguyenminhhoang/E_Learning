import Joi from "joi";

export const createWordSchema = Joi.object({
  word: Joi.string().trim().lowercase().required(),
  pronunciation: Joi.string()
    .trim()
    .pattern(
      /^\/([a-zA-Zɑæʌβɓʙçɕðɖɗəɚɛɜɝɞɟʄɡɠɢʛɦɧħɥɦʜɪɨʝɟʄɭɬɫɮɯɰŋɳɲɴɔɵɸɹɺɻɽɾʀʁɹʂʃʈʧʊʋⱱʌʍɯʏʑʐʒʔʡʕʢǀǁǂǃːˌˈ‿ˌ͡.()|~-]+)\/$/
    )
    .min(3)
    .max(50)
    .optional(),
  audio: Joi.string().uri().optional(),
  partOfSpeech: Joi.string()
    .valid(
      "noun",
      "verb",
      "adjective",
      "adverb",
      "preposition",
      "conjunction",
      "interjection",
      "pronoun"
    )
    .required(),
  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .default("beginner"),
  frequency: Joi.number().min(0).default(0),
  definitions: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(), // Allow _id for existing definitions
        meaning: Joi.string().required(),
        meaningVi: Joi.string().required(),
        examples: Joi.array()
          .items(
            Joi.object({
              _id: Joi.string().optional(), // Allow _id for existing examples
              sentence: Joi.string().required(),
              translation: Joi.string().optional(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .required(),
  synonyms: Joi.array().items(Joi.string()),
  antonyms: Joi.array().items(Joi.string()),
  relatedWords: Joi.array().items(Joi.string()),
  categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('')), // ObjectId, allow empty for filtering
  tags: Joi.array().items(Joi.string()),
  image: Joi.string().uri().optional(),
  difficulty: Joi.number().min(1).max(5).default(1),
  isActive: Joi.boolean().default(true),
  createdBy: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const importWordSchema = Joi.object({
  word: Joi.string().trim().lowercase().required(),

  pronunciation: Joi.string()
    .trim()
    .pattern(
      /^\/([a-zA-Zɑæʌβɓʙçɕðɖɗəɚɛɜɝɞɟʄɡɠɢʛɦɧħɥɦʜɪɨʝɟʄɭɬɫɮɯɰŋɳɲɴɔɵɸɹɺɻɽɾʀʁɹʂʃʈʧʊʋⱱʌʍɯʏʑʐʒʔʡʕʢǀǁǂǃːˌˈ‿ˌ͡.()|~-]+)\/$/
    )
    .min(3)
    .max(50)
    .optional(),

  audio: Joi.string().uri().optional(),

  partOfSpeech: Joi.string()
    .valid(
      "noun",
      "verb",
      "adjective",
      "adverb",
      "preposition",
      "conjunction",
      "interjection",
      "pronoun"
    )
    .required(),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .default("beginner"),

  frequency: Joi.number().min(0).default(0),

  categories: Joi.array().items(
    Joi.string().regex(/^[0-9a-fA-F]{24}$/) // ObjectId
  ),

  tags: Joi.array().items(Joi.string()),

  image: Joi.string().uri().optional(),

  difficulty: Joi.number().min(1).max(5).default(1),

  isActive: Joi.boolean().default(true),
});
