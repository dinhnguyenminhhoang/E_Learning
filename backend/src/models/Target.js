"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");

const DOCUMENT_NAME = "Target";
const COLLECTION_NAME = "Targets";

const targetSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, "Target key is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxLength: 100,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Target name is required"],
      trim: true,
      maxLength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    learningPaths: [
      {
        type: Schema.Types.ObjectId,
        ref: "LearningPath",
      },
    ],

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

targetSchema.index({ key: 1 });
targetSchema.index({ name: "text", description: "text", tags: "text" });
targetSchema.index({ createdAt: -1, status: 1 });

module.exports = model(DOCUMENT_NAME, targetSchema);
