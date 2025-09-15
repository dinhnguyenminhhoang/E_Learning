"use strict";

const { model, Schema, Types } = require("mongoose");
const crypto = require("crypto");

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      maxLength: 500,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: false,
  }
);

const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, "User reference is required"],
      ref: "User",
      index: true, 
    },

    keys: {
      publicKey: {
        type: String,
        required: [true, "Public key is required"],
        validate: {
          validator: function (v) {
            return v && v.includes("BEGIN PUBLIC KEY");
          },
          message: "Invalid public key format",
        },
      },
      privateKey: {
        type: String,
        required: [true, "Private key is required"],
        validate: {
          validator: function (v) {
            return v && v.includes("BEGIN PRIVATE KEY");
          },
          message: "Invalid private key format",
        },
      },
      algorithm: {
        type: String,
        enum: ["RS256", "RS384", "RS512"],
        default: "RS256",
      },
      keySize: {
        type: Number,
        enum: [2048, 4096],
        default: 2048,
      },
    },

    refreshToken: {
      token: {
        type: String,
        required: [true, "Refresh token is required"],
        unique: true,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
      scope: {
        type: [String],
        default: ["read", "write"],
      },
    },

    refreshTokensUsed: [refreshTokenSchema],

    session: {
      deviceId: {
        type: String,
        index: true,
      },
      deviceType: {
        type: String,
        enum: ["web", "mobile", "desktop", "tablet", "unknown"],
        default: "unknown",
      },
      userAgent: {
        type: String,
        maxLength: 1000,
      },
      ipAddress: {
        type: String,
      },
      location: {
        country: String,
        city: String,
        timezone: String,
      },
      lastUsedAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },

    security: {
      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
      revokedAt: {
        type: Date,
        default: null,
        index: true,
      },
      revokedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      revokedReason: {
        type: String,
        enum: [
          "user_logout",
          "admin_revoke",
          "security_breach",
          "token_rotation",
          "expired",
          "new_login",
        ],
        default: null,
      },
      isCompromised: {
        type: Boolean,
        default: false,
        index: true,
      },
      suspiciousActivity: [
        {
          type: {
            type: String,
            enum: [
              "unusual_location",
              "multiple_devices",
              "rapid_requests",
              "failed_verification",
            ],
          },
          detectedAt: {
            type: Date,
            default: Date.now,
          },
          details: {
            type: Schema.Types.Mixed,
          },
        },
      ],
    },

    usage: {
      accessCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastAccessAt: {
        type: Date,
        default: Date.now,
      },
      refreshCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastRefreshAt: {
        type: Date,
        default: null,
      },
    },

    metadata: {
      version: {
        type: String,
        default: "1.0",
      },
      environment: {
        type: String,
        enum: ["dev", "staging", "production"],
        default: process.env.NODE_ENV || "development",
      },
      notes: {
        type: String,
        maxLength: 500,
      },
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.keys?.privateKey;
        delete ret.refreshToken?.token;
        delete ret.refreshTokensUsed;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.keys?.privateKey;
        delete ret.refreshToken?.token;
        delete ret.refreshTokensUsed;
        return ret;
      },
    },
  }
);

// Compound Indexes cho performance
keyTokenSchema.index({ user: 1, "security.isActive": 1 }); // Active tokens per user
keyTokenSchema.index({ "refreshToken.token": 1, "security.isActive": 1 }); // Token validation
keyTokenSchema.index(
  { "refreshToken.expiresAt": 1 },
  { expireAfterSeconds: 0 }
); // TTL index
keyTokenSchema.index({ user: 1, "session.deviceId": 1 }); // Device-specific tokens
keyTokenSchema.index({ "session.lastUsedAt": -1, "security.isActive": 1 }); // Recent activity
keyTokenSchema.index({ "security.revokedAt": 1 }, { sparse: true }); // Revoked tokens
keyTokenSchema.index({ "security.isCompromised": 1 }, { sparse: true }); // Compromised tokens
keyTokenSchema.index({ createdAt: -1, user: 1 }); // Recent tokens per user

// Unique compound index để prevent duplicate active tokens per device
keyTokenSchema.index(
  { user: 1, "session.deviceId": 1, "security.isActive": 1 },
  {
    unique: true,
    partialFilterExpression: { "security.isActive": true },
    name: "unique_active_token_per_device",
  }
);

// ===== VIRTUALS =====

// Check if token is expired
keyTokenSchema.virtual("isExpired").get(function () {
  return this.refreshToken?.expiresAt < Date.now();
});

// Check if token is valid
keyTokenSchema.virtual("isValid").get(function () {
  return (
    this.security?.isActive &&
    !this.isExpired &&
    !this.security?.isCompromised &&
    !this.security?.revokedAt
  );
});

// Days until expiration
keyTokenSchema.virtual("daysUntilExpiration").get(function () {
  if (!this.refreshToken?.expiresAt) return null;
  const diff = this.refreshToken.expiresAt - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Token age in days
keyTokenSchema.virtual("tokenAge").get(function () {
  const diff = Date.now() - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// ===== METHODS =====

// Instance Methods
keyTokenSchema.methods.generateKeyPair = function (keySize = 2048) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  this.keys.publicKey = publicKey;
  this.keys.privateKey = privateKey;
  this.keys.keySize = keySize;

  return { publicKey, privateKey };
};

keyTokenSchema.methods.generateRefreshToken = function (expiresInDays = 30) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  this.refreshToken = {
    token,
    expiresAt,
    issuedAt: new Date(),
    scope: this.refreshToken?.scope || ["read", "write"],
  };

  return token;
};

keyTokenSchema.methods.markTokenAsUsed = function (tokenData = {}) {
  if (this.refreshToken?.token) {
    this.refreshTokensUsed.push({
      token: this.refreshToken.token,
      usedAt: new Date(),
      userAgent: tokenData.userAgent,
      ipAddress: tokenData.ipAddress,
    });

    // Keep only last 10 used tokens
    if (this.refreshTokensUsed.length > 10) {
      this.refreshTokensUsed = this.refreshTokensUsed.slice(-10);
    }
  }

  this.usage.refreshCount += 1;
  this.usage.lastRefreshAt = new Date();

  return this.save();
};

keyTokenSchema.methods.revokeToken = function (
  reason = "user_logout",
  revokedBy = null
) {
  this.security.isActive = false;
  this.security.revokedAt = new Date();
  this.security.revokedBy = revokedBy;
  this.security.revokedReason = reason;

  return this.save();
};

keyTokenSchema.methods.markAsCompromised = function (details = {}) {
  this.security.isCompromised = true;
  this.security.isActive = false;
  this.security.revokedAt = new Date();
  this.security.revokedReason = "security_breach";

  this.security.suspiciousActivity.push({
    type: "failed_verification",
    detectedAt: new Date(),
    details,
  });

  return this.save();
};

keyTokenSchema.methods.updateUsage = function (sessionData = {}) {
  this.usage.accessCount += 1;
  this.usage.lastAccessAt = new Date();
  this.session.lastUsedAt = new Date();

  if (
    sessionData.ipAddress &&
    sessionData.ipAddress !== this.session.ipAddress
  ) {
    this.security.suspiciousActivity.push({
      type: "unusual_location",
      detectedAt: new Date(),
      details: {
        oldIP: this.session.ipAddress,
        newIP: sessionData.ipAddress,
      },
    });
  }

  // Update session info
  Object.assign(this.session, sessionData);

  return this.save();
};

keyTokenSchema.methods.extendExpiration = function (additionalDays = 30) {
  if (this.refreshToken?.expiresAt) {
    const newExpiration = new Date(this.refreshToken.expiresAt);
    newExpiration.setDate(newExpiration.getDate() + additionalDays);
    this.refreshToken.expiresAt = newExpiration;
  }
  return this.save();
};

// Static Methods
keyTokenSchema.statics.findByRefreshToken = function (token) {
  return this.findOne({
    "refreshToken.token": token,
    "security.isActive": true,
    "security.isCompromised": false,
  }).populate("user", "name email status roles");
};

keyTokenSchema.statics.findActiveTokensByUser = function (userId) {
  return this.find({
    user: userId,
    "security.isActive": true,
    "security.isCompromised": false,
  }).sort({ "session.lastUsedAt": -1 });
};

keyTokenSchema.statics.revokeAllUserTokens = function (
  userId,
  reason = "user_logout"
) {
  return this.updateMany(
    {
      user: userId,
      "security.isActive": true,
    },
    {
      $set: {
        "security.isActive": false,
        "security.revokedAt": new Date(),
        "security.revokedReason": reason,
      },
    }
  );
};

keyTokenSchema.statics.cleanupExpiredTokens = function () {
  return this.deleteMany({
    $or: [
      { "refreshToken.expiresAt": { $lte: new Date() } },
      {
        "security.revokedAt": {
          $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }, // 30 days old
    ],
  });
};

keyTokenSchema.statics.getTokenStats = function (userId = null) {
  const matchStage = userId
    ? { $match: { user: new Types.ObjectId(userId) } }
    : { $match: {} };

  return this.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$security.isActive", true] }, 1, 0],
          },
        },
        expired: {
          $sum: {
            $cond: [{ $lte: ["$refreshToken.expiresAt", new Date()] }, 1, 0],
          },
        },
        compromised: {
          $sum: {
            $cond: [{ $eq: ["$security.isCompromised", true] }, 1, 0],
          },
        },
        avgUsage: { $avg: "$usage.accessCount" },
      },
    },
  ]);
};

keyTokenSchema.statics.detectSuspiciousTokens = function () {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.find({
    "security.isActive": true,
    $or: [
      { "usage.accessCount": { $gt: 1000 } }, // Very high usage
      { "security.suspiciousActivity.0": { $exists: true } }, // Has suspicious activity
      {
        "session.lastUsedAt": { $lt: oneDayAgo },
        "usage.accessCount": { $gt: 100 },
      }, // Inactive but high usage
    ],
  }).populate("user", "name email");
};

// ===== MIDDLEWARES =====

// Pre-save middleware
keyTokenSchema.pre("save", function (next) {
  // Generate device ID if not exists
  if (this.isNew && !this.session?.deviceId) {
    this.session.deviceId = crypto.randomBytes(16).toString("hex");
  }

  // Auto-generate key pair if not exists
  if (this.isNew && (!this.keys?.publicKey || !this.keys?.privateKey)) {
    this.generateKeyPair();
  }

  // Auto-generate refresh token if not exists
  if (this.isNew && !this.refreshToken?.token) {
    this.generateRefreshToken();
  }

  next();
});

// Pre-remove middleware
keyTokenSchema.pre(["deleteOne", "deleteMany"], function () {
  console.log("Cleaning up key tokens...");
});

// Post-save middleware
keyTokenSchema.post("save", function (doc) {
  if (doc.security?.isCompromised) {
    console.warn(`🚨 Token compromised for user: ${doc.user}`);
  }
});

// Query middleware
keyTokenSchema.pre(["find", "findOne"], function () {
  // Auto-populate user by default
  if (!this.getPopulatedPaths().includes("user")) {
    this.populate("user", "name email status roles");
  }
});

// ===== HOOKS =====

// Cleanup expired tokens daily
if (process.env.NODE_ENV === "production") {
  setInterval(
    async () => {
      try {
        const result = await keyTokenSchema.statics.cleanupExpiredTokens();
        if (result.deletedCount > 0) {
          console.log(`🧹 Cleaned up ${result.deletedCount} expired tokens`);
        }
      } catch (error) {
        console.error("❌ Token cleanup error:", error);
      }
    },
    24 * 60 * 60 * 1000
  ); // 24 hours
}

module.exports = model(DOCUMENT_NAME, keyTokenSchema);
