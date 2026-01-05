"use strict";

const Joi = require("joi");
const {
  commonFields,
  emailValidator,
  phoneValidator,
  urlValidator,
} = require("./common");

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "name phải có ít nhất 2 ký tự",
    "string.max": "name không được vượt quá 100 ký tự",
  }),

  phoneNumber: phoneValidator.allow("", null).optional(),

  profile: Joi.object({
    avatar: urlValidator.optional(),
    bio: Joi.string().max(500).optional().messages({
      "string.max": "bio không được vượt quá 500 ký tự",
    }),
    experience: Joi.string()
      .valid("beginner", "intermediate", "advanced")
      .optional()
      .messages({
        "any.only":
          "experience phải là một trong: beginner, intermediate, advanced",
      }),
    learningPreferences: Joi.object({
      dailyGoal: Joi.number().integer().min(1).optional().messages({
        "number.min": "dailyGoal phải ít nhất là 1",
      }),
      studyReminder: Joi.boolean().optional(),
      preferredStudyTime: Joi.string()
        .valid("morning", "afternoon", "evening", "night")
        .optional()
        .messages({
          "any.only":
            "preferredStudyTime phải là một trong: morning, afternoon, evening, night",
        }),
      difficultyLevel: Joi.string()
        .valid("beginner", "intermediate", "advanced")
        .optional()
        .messages({
          "any.only":
            "difficultyLevel phải là một trong: beginner, intermediate, advanced",
        }),
    }).optional(),
  }).optional(),
});

const updateAvatarSchema = Joi.object({
  avatar: urlValidator.required().messages({
    "any.required": "avatar là bắt buộc",
    "string.uri": "avatar phải là URL hợp lệ",
  }),
});

const updateUserAdminSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "name phải có ít nhất 2 ký tự",
    "string.max": "name không được vượt quá 100 ký tự",
  }),

  email: emailValidator.optional(),

  phoneNumber: phoneValidator.allow("", null).optional(),

  roles: Joi.array()
    .items(Joi.string().valid("USER", "ADMIN", "MODERATOR"))
    .optional()
    .messages({
      "any.only": "roles phải là một trong: USER, ADMIN, MODERATOR",
      "array.base": "roles phải là mảng",
    }),

  status: commonFields.status,

  onboardingStatus: Joi.string()
    .valid("not_started", "in_progress", "completed")
    .optional()
    .messages({
      "any.only":
        "onboardingStatus phải là một trong: not_started, in_progress, completed",
    }),

  profile: Joi.object({
    avatar: urlValidator.optional(),
    bio: Joi.string().max(500).optional().messages({
      "string.max": "bio không được vượt quá 500 ký tự",
    }),
    experience: Joi.string()
      .valid("beginner", "intermediate", "advanced")
      .optional()
      .messages({
        "any.only":
          "experience phải là một trong: beginner, intermediate, advanced",
      }),
  }).optional(),
});

module.exports = {
  updateProfileSchema,
  updateAvatarSchema,
  updateUserAdminSchema,
};
