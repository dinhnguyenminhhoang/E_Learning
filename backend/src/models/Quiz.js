"use strict";
const { model, Schema } = require("mongoose");
const questionSchema = require("./subModel/question.schema");
const DOCUMENT_NAME = "Quiz";
const COLLECTION_NAME = "Quizzes";
const quizSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Quiz title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            index: true,
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["practice", "test", "daily_challenge"],
            default: "practice",
        },
        questions: [questionSchema],
        totalQuestions: {
            type: Number,
            required: true,
        },
        totalPoints: {
            type: Number,
            required: true,
        },
        timeLimit: {
            type: Number, // minutes
            default: null,
        },
        passScore: {
            type: Number,
            default: 70, // percentage
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        tags: [{ type: String }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
quizSchema.index({ level: 1, isActive: 1 });
quizSchema.index({ category: 1, level: 1 });
module.exports = model(DOCUMENT_NAME, quizSchema);