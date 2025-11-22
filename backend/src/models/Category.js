"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "Category";
const COLLECTION_NAME = "Categories";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name (EN) is required"],
      trim: true,
      unique: true,
      index: true,
      maxLength: 150,
    },

    nameVi: {
      type: String,
      required: [true, "Category name (VI) is required"],
      trim: true,
      maxLength: 150,
    },

    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: null,
      index: true,
    },

    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        return ret;
      },
    },
  }
);

// ===== INDEXES =====
categorySchema.index({ name: "text", nameVi: "text", description: "text" });
categorySchema.index({ createdAt: -1, status: 1 });

module.exports = model(DOCUMENT_NAME, categorySchema);
