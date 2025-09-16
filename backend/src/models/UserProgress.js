"use strict";
const { model, Schema } = require("mongoose");
const wordProgressSchema = require("./subModel/wordProgress.schema");
const DOCUMENT_NAME = "UserProgress";
const COLLECTION_NAME = "UserProgresses";

const userProgressSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        totalWordsLearned: {
            type: Number,
            default: 0,
        },
        wordsProgress: [wordProgressSchema],
        dailyGoal: {
            type: Number,
            default: 10,
            min: 1,
            max: 100,
        },
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        lastStudyDate: {
            type: Date,
            default: null,
        },
        totalPoints: {
            type: Number,
            default: 0,
        },
        weeklyStats: {
            wordsLearned: { type: Number, default: 0 },
            quizzesCompleted: { type: Number, default: 0 },
            timeSpent: { type: Number, default: 0 }, // minutes
            accuracy: { type: Number, default: 0 }, // percentage
        },
        preferences: {
            studyReminder: { type: Boolean, default: true },
            soundEnabled: { type: Boolean, default: true },
            autoPlayAudio: { type: Boolean, default: true },
            reviewMode: {
                type: String,
                enum: ["flashcard", "quiz", "mixed"],
                default: "mixed",
            },
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
// Compound indexes
userProgressSchema.index({ user: 1 }, { unique: true });
userProgressSchema.index({ "wordsProgress.nextReviewAt": 1 });
module.exports = model(DOCUMENT_NAME, userProgressSchema);