"use strict";
const { Schema } = require("mongoose");

const wordProgressSchema = new Schema({
    word: {
        type: Schema.Types.ObjectId,
        ref: "Word",
        required: true,
    },
    masteryLevel: {
        type: Number,
        min: 0,
        max: 5,
        default: 0, // 0: chưa học, 1-5: mức độ thành thạo
    },
    timesReviewed: {
        type: Number,
        default: 0,
    },
    timesCorrect: {
        type: Number,
        default: 0,
    },
    timesIncorrect: {
        type: Number,
        default: 0,
    },
    lastReviewedAt: {
        type: Date,
        default: null,
    },
    nextReviewAt: {
        type: Date,
        default: null,
    },
    intervalDays: {
        type: Number,
        default: 1, // Spaced repetition interval
    },
    easeFactor: {
        type: Number,
        default: 2.5, // SM-2 algorithm ease factor
        min: 1.3,
    },
}, { _id: false });
module.exports = wordProgressSchema;