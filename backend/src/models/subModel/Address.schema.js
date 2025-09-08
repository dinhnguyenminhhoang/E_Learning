"use strict";
const { Schema } = require("mongoose");

const normalize = (v) => (typeof v === "string" ? v.trim() : v);

const addressSchema = new Schema(
  {
    street: { type: String, set: normalize, trim: true, maxLength: 200 },
    city: { type: String, set: normalize, trim: true, maxLength: 100 },
    province: { type: String, set: normalize, trim: true, maxLength: 100 },
    country: {
      type: String,
      set: normalize,
      trim: true,
      maxLength: 100,
      default: "Vietnam",
    },
    postalCode: { type: String, set: normalize, trim: true, maxLength: 20 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, id: false }
);

module.exports = addressSchema;
