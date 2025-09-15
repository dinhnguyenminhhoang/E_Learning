"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Category";
const COLLECTION_NAME = "Categories";
const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            index: true,
        },
        nameVi: {
            type: String,
            required: [true, "Vietnamese name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            default: "📚",
        },
        color: {
            type: String,
            default: "#3B82F6",
            validate: {
                validator: function (v) {
                    return /^#[0-9A-F]{6}$/i.test(v);
                },
                message: "Color must be a valid hex color",
            },
        },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "all"],
            default: "all",
            index: true,
        },
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        wordCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);
categorySchema.index({ isActive: 1, level: 1 });
categorySchema.index({ parentCategory: 1 });
module.exports = model(DOCUMENT_NAME, categorySchema);