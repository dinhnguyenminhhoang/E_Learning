"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "UserAchievement";
const COLLECTION_NAME = "UserAchievements";
const userAchievementSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        achievement: {
            type: Schema.Types.ObjectId,
            ref: "Achievement",
            required: true,
        },
        unlockedAt: {
            type: Date,
            default: Date.now,
        },
        progress: {
            type: Number,
            default: 0,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
module.exports = model(DOCUMENT_NAME, userAchievementSchema);