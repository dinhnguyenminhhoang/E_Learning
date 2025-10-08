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
      lowercase: true,
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
      },
    ],

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
targetSchema.index({ key: 1 });
targetSchema.index({ name: "text", description: "text", tags: "text" });
targetSchema.index({ createdAt: -1, status: 1 });

// ===== VIRTUALS =====
targetSchema.virtual("isArchived").get(function () {
  return this.status === "archived";
});

// ===== METHODS =====
targetSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// ===== STATICS =====
targetSchema.statics.findActiveTargets = function () {
  return this.find({ status: "active", updatedAt: null });
};

targetSchema.statics.searchTargets = function (query, options = {}) {
  const { limit = 20, skip = 0 } = options;

  const searchQuery = {
    $text: { $search: query },
    status: "active",
    updatedAt: null,
  };

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// ===== MIDDLEWARES =====

// Soft delete
targetSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date(), status: "inactive" });
});

// Query middleware để loại bỏ deleted targets
// targetSchema.pre(
//   ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
//   function () {
//     if (!("status" in this.getQuery())) {
//       this.where({ status: { $ne: STATUS.DELETED } });
//     }
//   }
// );

module.exports = model(DOCUMENT_NAME, targetSchema);
