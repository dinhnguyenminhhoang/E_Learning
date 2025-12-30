"use strict";
const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "WritingTemplate";
const COLLECTION_NAME = "WritingTemplates";

const writingTemplateSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        titleVi: {
            type: String,
            trim: true,
        },
        prompt: {
            type: String,
            required: [true, "Prompt is required"],
            trim: true,
        },
        promptVi: {
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
            enum: ["essay", "email", "story", "description", "opinion"],
            default: "essay",
            index: true,
        },
        category: {
            type: String,
            trim: true,
            index: true,
        },
        minWords: {
            type: Number,
            default: 100,
        },
        maxWords: {
            type: Number,
            default: 300,
        },
        sampleAnswer: {
            type: String,
            trim: true,
        },
        hints: [{
            type: String,
            trim: true,
        }],
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

writingTemplateSchema.index({ title: "text", prompt: "text", titleVi: "text", promptVi: "text" });
writingTemplateSchema.index({ level: 1, type: 1, status: 1 });
writingTemplateSchema.index({ category: 1, level: 1 });

module.exports = model(DOCUMENT_NAME, writingTemplateSchema);
