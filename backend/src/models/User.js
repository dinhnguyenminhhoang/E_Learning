"use strict";

const { model, Schema, Types } = require("mongoose");
const bcrypt = require("bcrypt");
const verificationSchema = require("./subModel/Verification.schema");
const { urlValidator } = require("../utils");
const { STATUS } = require("../constans/STATUS.constans");
const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters"],
      maxLength: [100, "Name cannot exceed 100 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          const vnPhoneRegex = /^(\+84|84|0)[3-9]\d{8}$/;

          return vnPhoneRegex.test(v.replace(/[\s.-]/g, ""));
        },
        message: "Số điện thoại không hợp lệ",
      },
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: OBject.values(STATUS),
        message: "Status must be active, inactive, suspended, or pending",
      },
      default: STATUS.PENDING,
      index: true,
    },
    verification: {
      type: verificationSchema,
      default: () => ({}),
    },
    profile: {
      avatar: {
        type: String,
        trim: true,
        validate: {
          validator: urlValidator,
          message: "Avatar must be a valid URL",
        },
      },
      bio: { type: String, trim: true, maxLength: 500 },
      experience: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        default: "beginner",
      },
      learningPreferences: {
        dailyGoal: {type: Number, default: 10},
        studyReminder: {type: Boolean, default: true},
        preferredStudyTime: {type: String},
        difficultyLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'beginner'
        }
      }
    },
    statistics: {
      totalWordsLearned: {type: Number, default: 0},
      currentStreak: {type: Number, default: 0},
      longestStreak : {type: Number, default: 0},
      totalStudyTime: {type: Number, default: 0},
      averageAccuracy: {type: Number, default: 0}
    },
    roles: [
      {
        type: String,
        enum: {
          values: ["USER", "ADMIN", "MANAGER", "MODERATOR", "SELLER"],
          message: "Invalid role",
        },
        default: "USER",
      },
    ],
    security: {
      lastLoginAt: {
        type: Date,
        default: null,
        index: true,
      },
      lastLoginIP: {
        type: String,
        default: null,
      },
      loginAttempts: {
        type: Number,
        default: 0,
        max: 10,
      },
      lockUntil: {
        type: Date,
        default: null,
      },
      passwordChangedAt: {
        type: Date,
        default: Date.now,
      },
      refreshTokens: [
        {
          token: String,
          expiresAt: Date,
          createdAt: { type: Date, default: Date.now },
        },
      ],
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
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.security?.refreshTokens;
        delete ret.verification?.twoFactorSecret;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.security?.refreshTokens;
        delete ret.verification?.twoFactorSecret;
        return ret;
      },
    },
  }
);
userSchema.index({ email: 1, status: 1 }); // Login queries
userSchema.index({ status: 1, "verification.emailVerified": 1 }); // Active verified users
userSchema.index({ roles: 1, status: 1 }); // Admin/role queries
userSchema.index({ createdAt: -1, status: 1 }); // Recent users
userSchema.index({ "security.lastLoginAt": -1 }); // Recent login sorting
userSchema.index({ deletedAt: 1 }, { sparse: true }); // Soft delete queries

// Geospatial Index (nếu cần location-based features)
userSchema.index({ "addresses.location": "2dsphere" });

// TTL Index cho expired refresh tokens
userSchema.index(
  { "security.refreshTokens.expiresAt": 1 },
  { expireAfterSeconds: 0 }
);

// ===== VIRTUALS =====

// Full name virtual
userSchema.virtual("displayName").get(function () {
  return this.name || this.email.split("@")[0];
});

// Account locked virtual
userSchema.virtual("isLocked").get(function () {
  return !!(this.security?.lockUntil && this.security.lockUntil > Date.now());
});

userSchema.virtual("favoriteCount").get(function () {
  return this.portfolios?.favorites?.length || 0;
});

// ===== METHODS =====

// Instance Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = function () {
  if (this.security?.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { "security.lockUntil": 1, "security.loginAttempts": 1 },
    });
  }

  const updates = { $inc: { "security.loginAttempts": 1 } };

  if (this.security?.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { "security.lockUntil": Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { "security.lockUntil": 1, "security.loginAttempts": 1 },
  });
};
// Static Methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    deletedAt: null,
  });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({
    status: "active",
    deletedAt: null,
  });
};

userSchema.statics.findByRole = function (role) {
  return this.find({
    roles: role,
    status: "active",
    deletedAt: null,
  });
};

userSchema.statics.searchUsers = function (query, options = {}) {
  const { limit = 20, skip = 0, status = "active", roles = null } = options;

  const searchQuery = {
    $text: { $search: query },
    status,
    deletedAt: null,
  };

  if (roles) {
    searchQuery.roles = { $in: Array.isArray(roles) ? roles : [roles] };
  }

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .skip(skip);
};

// ===== MIDDLEWARES =====

// Pre-save middleware
userSchema.pre("save", async function (next) {
  // Hash password if modified
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
      this.security.passwordChangedAt = new Date();
    } catch (error) {
      return next(error);
    }
  }

  // Lowercase email
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase();
  }

  // Default role
  if (this.isNew && (!this.roles || this.roles.length === 0)) {
    this.roles = ["USER"];
  }

  next();
});

// Post-save middleware
userSchema.post("save", function (doc) {
  console.log(`User ${doc.email} saved successfully`);
});

// Pre-remove middleware (cho soft delete)
userSchema.pre(["deleteOne", "deleteMany"], function () {
  // Soft delete instead of hard delete
  this.updateOne(
    {},
    {
      deletedAt: new Date(),
      status: "inactive",
    }
  );
});

// Query middleware để loại bỏ deleted users
userSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!this.getQuery().deletedAt) {
      this.where({ deletedAt: null });
    }
  }
);
module.exports = model(DOCUMENT_NAME, userSchema);
