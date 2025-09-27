"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Achievement";
const COLLECTION_NAME = "Achievements";

const criteriaSchema = new Schema(
  {
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true, // ví dụ: "days", "words", "points", "sessions"
      trim: true,
    },
  },
  { _id: false }
);

const achievementSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    nameVi: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    icon: {
      type: String,
      trim: true,
      default: null,
    },

    type: {
      type: String,
      enum: ["streak", "words_learned", "quiz_score", "sessions", "custom"],
      required: true,
      index: true,
    },

    criteria: {
      type: criteriaSchema,
      required: true,
    },

    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
      index: true,
    },

    points: {
      type: Number,
      min: 0,
      default: 0,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
  }
);

// ===== INDEXES =====
achievementSchema.index({ type: 1, rarity: 1 });
achievementSchema.index({ "criteria.unit": 1 });

// ===== VIRTUALS =====
achievementSchema.virtual("displayName").get(function () {
  return this.nameVi || this.name;
});

// ===== STATICS =====
achievementSchema.statics.findByType = function (type) {
  return this.find({ type, deletedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
achievementSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { deletedAt: new Date() });
});

// Query middleware để tự động filter soft delete
achievementSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);

module.exports = model(DOCUMENT_NAME, achievementSchema);
