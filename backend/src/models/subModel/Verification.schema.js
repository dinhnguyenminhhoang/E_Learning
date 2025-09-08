"use strict";
const { Schema } = require("mongoose");

const verificationSchema = new Schema(
  {
    emailVerified: { type: Boolean, default: false, index: true },
    emailVerifiedAt: { type: Date, default: null },
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date, default: null },
    twoFactorEnabled: { type: Boolean, default: false, index: true },
    twoFactorSecret: { type: String, select: false },
  },
  { _id: false }
);

module.exports = verificationSchema;
