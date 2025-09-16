"use strict";
const { Schema } = require("mongoose");

const questionSchema = new Schema({
    word: {
        type: Schema.Types.ObjectId,
        ref: "Word",
        required: true,
    },
    type: {
        type: String,
        enum: ["multiple_choice", "fill_blank", "matching", "true_false"],
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
    }],
    correctAnswer: { type: String },
    explanation: { type: String },
    points: {
        type: Number,
        default: 10,
        min: 1,
    },
}, { _id: true });
module.exports = questionSchema;