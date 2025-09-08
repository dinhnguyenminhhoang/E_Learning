"use strict";
const { Schema } = require("mongoose");

const urlValidator = (v) => !v || /^https?:\/\/.+/i.test(v);

const profileSchema = new Schema(
  {
    avatar: {
      type: String,
      trim: true,
      validate: {
        validator: urlValidator,
        message: "Avatar must be a valid URL",
      },
    },
    bio: { type: String, trim: true, maxLength: 500 },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: urlValidator,
        message: "Website must be a valid URL",
      },
    },
    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
        validate: {
          validator: urlValidator,
          message: "LinkedIn must be a valid URL",
        },
      },
      twitter: {
        type: String,
        trim: true,
        validate: {
          validator: urlValidator,
          message: "Twitter/X must be a valid URL",
        },
      },
    },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
  },
  { _id: false }
);
module.exports = profileSchema;
