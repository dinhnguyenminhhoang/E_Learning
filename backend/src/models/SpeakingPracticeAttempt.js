"use strict";

const { Schema, model } = require("mongoose");

const speakingPracticeAttemptSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        templateId: {
            type: Schema.Types.ObjectId,
            ref: "SpeakingTemplate",
            required: false,
        },
        prompt: {
            type: String,
            required: false,
        },
        userAudioUrl: {
            type: String,
            required: false,
        },
        transcription: {
            type: String,
            required: false,
        },
        feedback: {
            pronunciationScore: {
                type: Number,
                min: 0,
                max: 100,
            },
            fluencyScore: {
                type: Number,
                min: 0,
                max: 100,
            },
            grammarScore: {
                type: Number,
                min: 0,
                max: 100,
            },
            vocabularyScore: {
                type: Number,
                min: 0,
                max: 100,
            },
            overallFeedback: String,
            suggestions: [String],
        },
        accuracy: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        duration: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["completed", "deleted"],
            default: "completed",
        },
        completedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: "speaking_practice_attempts",
    }
);

speakingPracticeAttemptSchema.index({ user: 1, completedAt: -1 });
speakingPracticeAttemptSchema.index({ user: 1, status: 1 });

const SpeakingPracticeAttempt = model(
    "SpeakingPracticeAttempt",
    speakingPracticeAttemptSchema
);

module.exports = SpeakingPracticeAttempt;
