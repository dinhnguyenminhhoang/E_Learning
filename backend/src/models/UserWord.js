"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userWordSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        word: {
            type: String,
            required: true,
            trim: true,
        },
        meaningVi: {
            type: String,
            required: true,
            trim: true,
        },
        pronunciation: {
            type: String,
            trim: true,
        },
        example: {
            type: String,
            trim: true,
        },
        exampleVi: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["noun", "verb", "adjective", "adverb", "phrase", "other"],
            default: "other",
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        tags: [{
            type: String,
            trim: true,
        }],
        deleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

userWordSchema.index({ user: 1, deleted: 1, createdAt: -1 });
userWordSchema.index({ user: 1, word: "text", meaningVi: "text" });

const UserWord = mongoose.model("UserWord", userWordSchema);

module.exports = UserWord;
