"use strict";
const { model, Schema } = require("mongoose");
const flashcardReviewSchema = require("./subModel/flashcardReview.schema");
const DOCUMENT_NAME = "StudySession";
const COLLECTION_NAME = "StudySessions";

const studySessionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["flashcard", "quiz", "mixed"],
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        wordsStudied: [{
            type: Schema.Types.ObjectId,
            ref: "Word",
        }],
        flashcardReviews: [flashcardReviewSchema],
        quizAttempts: [{
            type: Schema.Types.ObjectId,
            ref: "QuizAttempt",
        }],
        duration: {
            type: Number, // minutes
            required: true,
        },
        wordsCount: {
            type: Number,
            default: 0,
        },
        accuracy: {
            type: Number, // percentage
            default: 0,
        },
        pointsEarned: {
            type: Number,
            default: 0,
        },
        startedAt: {
            type: Date,
            required: true,
        },
        endedAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
studySessionSchema.index({ user: 1, startedAt: -1 });
studySessionSchema.index({ user: 1, type: 1 });
module.exports = model(DOCUMENT_NAME, studySessionSchema);