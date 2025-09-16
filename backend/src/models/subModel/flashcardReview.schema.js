const { Schema } = require("mongoose");

const flashcardReviewSchema = new Schema({
    word: {
        type: Schema.Types.ObjectId,
        ref: "Word",
        required: true,
    },
    response: {
        type: String,
        enum: ["again", "hard", "good", "easy"],
        required: true,
    },
    responseTime: {
        type: Number, // seconds
        required: true,
    },
    previousInterval: { type: Number },
    newInterval: { type: Number },
}, { _id: false });
module.exports = flashcardReviewSchema;