"use strict";
const { Schema } = require("mongoose");

const answerSchema = new Schema({
    questionId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    selectedAnswer: { type: String },
    selectedOptions: [{ type: String }],
    isCorrect: {
        type: Boolean,
        required: true,
    },
    pointsEarned: {
        type: Number,
        default: 0,
    },
    timeSpent: {
        type: Number, // seconds
        default: 0,
    },
}, { _id: false });
module.exports = answerSchema;