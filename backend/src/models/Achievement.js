"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Achievement";
const COLLECTION_NAME = "Achievements";
const achievementSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Achievement name is required"],
            trim: true,
        },
        nameVi: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        descriptionVi: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: "🏆",
        },
        type: {
            type: String,
            enum: ["streak", "words_learned", "quiz_score", "time_spent", "special"],
            required: true,
        },
        criteria: {
            target: { type: Number, required: true },
            unit: {
                type: String,
                enum: ["days", "words", "percentage", "minutes", "sessions"],
                required: true,
            },
        },
        rarity: {
            type: String,
            enum: ["common", "rare", "epic", "legendary"],
            default: "common",
        },
        points: {
            type: Number,
            required: true,
            min: 1,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
module.exports = model(DOCUMENT_NAME, achievementSchema);