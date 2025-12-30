"use strict";
const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "SpeakingTemplate";
const COLLECTION_NAME = "SpeakingTemplates";

const speakingTemplateSchema = new Schema(
    {
        text: {
            type: String,
            required: [true, "Text is required"],
            trim: true,
        },
        textVi: {
            type: String,
            trim: true,
        },
        level: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "easy",
            index: true,
        },
        type: {
            type: String,
            enum: ["word", "sentence"],
            default: "sentence",
            index: true,
        },
        category: {
            type: String,
            trim: true,
            index: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: Object.values(STATUS),
            default: STATUS.ACTIVE,
        },
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

speakingTemplateSchema.index({ text: "text", textVi: "text" });
speakingTemplateSchema.index({ level: 1, type: 1, status: 1 });
speakingTemplateSchema.index({ category: 1, level: 1 });

module.exports = model(DOCUMENT_NAME, speakingTemplateSchema);
