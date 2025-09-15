"use strict";
const { model, Schema } = require("mongoose");
const answerSchema = require("./subModel/answer.schema");
const DOCUMENT_NAME = "QuizAttempt";
const COLLECTION_NAME = "QuizAttempts";

const quizAttemptSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
            index: true,
        },
        answers: [answerSchema],
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        correctAnswers: {
            type: Number,
            required: true,
        },
        timeSpent: {
            type: Number, // seconds
            default: 0,
        },
        status: {
            type: String,
            enum: ["completed", "abandoned", "in_progress"],
            default: "in_progress",
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        isPassed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
// Compound indexes
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, completedAt: -1 });
module.exports = model(DOCUMENT_NAME, quizAttemptSchema);