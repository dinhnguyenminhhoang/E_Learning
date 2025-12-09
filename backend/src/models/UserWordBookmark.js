"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userWordBookmarkSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        word: {
            type: Schema.Types.ObjectId,
            ref: "Word",
            required: true,
            index: true,
        },
        bookmarkedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        source: {
            type: String,
            enum: ["lesson", "block", "manual", "other"],
            default: "manual",
        },
        sourceBlock: {
            type: Schema.Types.ObjectId,
            ref: "Block",
        },
        notes: {
            type: String,
            trim: true,
        },
        masteryLevel: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

userWordBookmarkSchema.index({ user: 1, word: 1 }, { unique: true });
userWordBookmarkSchema.index({ user: 1, bookmarkedAt: -1 });

const UserWordBookmark = mongoose.model("UserWordBookmark", userWordBookmarkSchema);

module.exports = UserWordBookmark;
