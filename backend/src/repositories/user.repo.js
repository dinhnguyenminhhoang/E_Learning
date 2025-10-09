"use strict";

const { STATUS } = require("../constants/status.constans");
const User = require("../models/User");
const { Types } = require("mongoose");

/**
 * User Repository
 * Centralized data access layer cho User operations
 * Implements Repository Pattern với security, caching và performance optimization
 */
class UserRepository {
  constructor() {
    this.model = User;
    this.defaultSelect =
      "-password -security.refreshTokens -verification.twoFactorSecret";
    this.sensitiveFields = [
      "password",
      "security.refreshTokens",
      "verification.twoFactorSecret",
    ];
  }

  // ===== CREATE OPERATIONS =====

  /**
   * Tạo user mới
   * @param {Object} userData - User data
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created user
   */
  async create(userData, options = {}) {
    try {
      const { sendWelcomeEmail = true, autoVerify = false } = options;

      // Validate email không trùng
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }

      const user = new this.model(userData);

      // Auto verify nếu cần
      if (autoVerify) {
        user.verification.emailVerified = true;
        user.verification.emailVerifiedAt = new Date();
        user.status = "active";
      }

      await user.save();

      console.log(`✅ Created new user: ${user.email}`);

      // Log activity
      await this.logActivity(user._id, "user_created", {
        email: user.email,
        method: "registration",
      });

      return await this.findById(user._id);
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Bulk create users
   * @param {Array} usersData - Array of user data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Creation result
   */
  async bulkCreate(usersData, options = {}) {
    try {
      const { validateEmails = true, defaultRole = "USER" } = options;

      // Validate emails nếu cần
      if (validateEmails) {
        const emails = usersData.map((u) => u.email.toLowerCase());
        const existing = await this.model
          .find({
            email: { $in: emails },
          })
          .select("email")
          .lean();

        if (existing.length > 0) {
          throw new Error(
            `Duplicate emails found: ${existing.map((u) => u.email).join(", ")}`
          );
        }
      }

      // Add default values
      const processedUsers = usersData.map((userData) => ({
        ...userData,
        roles: userData.roles || [defaultRole],
        status: userData.status || "pending",
      }));

      const result = await this.model.insertMany(processedUsers, {
        ordered: false, // Continue on error
      });

      console.log(`📦 Bulk created ${result.length} users`);
      return {
        created: result.length,
        users: result.map((u) => u._id),
      };
    } catch (error) {
      console.error("❌ Error bulk creating users:", error);
      throw this.handleError(error);
    }
  }

  // ===== READ OPERATIONS =====

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} User document
   */
  async findById(userId, options = {}) {
    try {
      const {
        includeSensitive = false,
        includeDeleted = false,
        populate = [],
      } = options;

      const query = { _id: userId };
      if (!includeDeleted) {
        query.status = { $ne: STATUS.DELETED };
      }

      let select = includeSensitive ? "" : this.defaultSelect;

      let queryBuilder = this.model.findOne(query).select(select);

      // Handle populate
      if (populate.length > 0) {
        populate.forEach((pop) => {
          if (typeof pop === "string") {
            queryBuilder = queryBuilder.populate(pop);
          } else {
            queryBuilder = queryBuilder.populate(pop);
          }
        });
      }

      const user = await queryBuilder.lean();
      return user;
    } catch (error) {
      console.error("❌ Error finding user by ID:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} User document
   */
  async findByEmail(email, options = {}) {
    try {
      const {
        includeSensitive = false,
        includeDeleted = false,
        includePassword = false,
      } = options;

      const query = {
        email: email.toLowerCase(),
      };

      if (!includeDeleted) {
        query.status = { $ne: STATUS.DELETED };
      }

      let select = this.defaultSelect;
      if (includeSensitive) {
        select = "";
      } else if (includePassword) {
        select = this.defaultSelect.replace("-password", "");
      }

      const user = await this.model.findOne(query).select(select).lean();
      console.log("🔍 Query:", query);
      console.log("🔍 Found user:", user);
      return user;
    } catch (error) {
      console.error("❌ Error finding user by email:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Find users with pagination
   * @param {Object} query - Query filter
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated result
   */
  async findWithPagination(query = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = -1,
        select = this.defaultSelect,
        populate = [],
      } = options;

      const skip = (page - 1) * limit;

      // Default filters
      const finalQuery = {
        updatedAt: null,
        ...query,
      };

      let queryBuilder = this.model
        .find(finalQuery)
        .select(select)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);

      // Handle populate
      if (populate.length > 0) {
        populate.forEach((pop) => {
          queryBuilder = queryBuilder.populate(pop);
        });
      }

      const [users, total] = await Promise.all([
        queryBuilder.lean(),
        this.model.countDocuments(finalQuery),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("❌ Error finding users with pagination:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Search users với text search
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchUsers(searchTerm, options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        status = "active",
        roles = null,
        includeScore = true,
      } = options;

      const query = {
        $text: { $search: searchTerm },
        updatedAt: null,
      };

      if (status) {
        query.status = status;
      }

      if (roles) {
        query.roles = { $in: Array.isArray(roles) ? roles : [roles] };
      }

      const projection = includeScore
        ? { ...this.defaultSelect, score: { $meta: "textScore" } }
        : this.defaultSelect;

      const users = await this.model
        .find(query, projection)
        .sort(
          includeScore ? { score: { $meta: "textScore" } } : { createdAt: -1 }
        )
        .limit(limit)
        .skip(skip)
        .lean();

      return users;
    } catch (error) {
      console.error("❌ Error searching users:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Find users by role
   * @param {string|Array} roles - Role(s) to find
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with specified roles
   */
  async findByRole(roles, options = {}) {
    try {
      const {
        status = "active",
        limit = 50,
        sortBy = "createdAt",
        sortOrder = -1,
      } = options;

      const roleArray = Array.isArray(roles) ? roles : [roles];

      const users = await this.model
        .find({
          roles: { $in: roleArray },
          status,
          updatedAt: null,
        })
        .select(this.defaultSelect)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .lean();

      return users;
    } catch (error) {
      console.error("❌ Error finding users by role:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Find active users
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Active users
   */
  async findActiveUsers(options = {}) {
    try {
      const { limit = 100, lastLoginDays = 30 } = options;

      const lastLoginCutoff = new Date();
      lastLoginCutoff.setDate(lastLoginCutoff.getDate() - lastLoginDays);

      const users = await this.model
        .find({
          status: "active",
          "verification.emailVerified": true,
          "security.lastLoginAt": { $gte: lastLoginCutoff },
          updatedAt: null,
        })
        .select(this.defaultSelect)
        .sort({ "security.lastLoginAt": -1 })
        .limit(limit)
        .lean();

      return users;
    } catch (error) {
      console.error("❌ Error finding active users:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user portfolio statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Portfolio stats
   */
  async getPortfolioStats(userId) {
    try {
      const user = await this.model
        .findById(userId)
        .select("portfolioStats portfolios")
        .lean();

      if (!user) {
        throw new Error("User not found");
      }

      return {
        stats: user.portfolioStats || {},
        counts: {
          owned: user.portfolios?.owned?.length || 0,
          favorites: user.portfolios?.favorites?.length || 0,
          wishlist: user.portfolios?.wishlist?.length || 0,
          purchased: user.portfolios?.purchased?.length || 0,
        },
      };
    } catch (error) {
      console.error("❌ Error getting portfolio stats:", error);
      throw this.handleError(error);
    }
  }

  // ===== UPDATE OPERATIONS =====

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated user
   */
  async updateById(userId, updateData, options = {}) {
    try {
      const { runValidators = true, returnNew = true } = options;

      // Remove sensitive fields from update
      const safeUpdateData = { ...updateData };
      this.sensitiveFields.forEach((field) => {
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          if (safeUpdateData[parent]?.[child]) {
            delete safeUpdateData[parent][child];
          }
        } else {
          delete safeUpdateData[field];
        }
      });

      const user = await this.model.findByIdAndUpdate(
        userId,
        { $set: safeUpdateData },
        {
          new: returnNew,
          runValidators,
          select: this.defaultSelect,
        }
      );

      if (!user) {
        throw new Error("User not found");
      }

      console.log(`📝 Updated user: ${userId}`);
      await this.logActivity(userId, "user_updated", {
        fields: Object.keys(safeUpdateData),
      });

      return user;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Update result
   */
  async updatePassword(userId, newPassword, options = {}) {
    try {
      const { revokeTokens = true, logActivity = true } = options;

      const user = await this.model.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Update password (sẽ auto hash trong pre-save middleware)
      user.password = newPassword;
      user.security.passwordChangedAt = new Date();

      await user.save();

      if (logActivity) {
        await this.logActivity(userId, "password_changed", {
          revokeTokens,
          timestamp: new Date(),
        });
      }

      console.log(`🔐 Password updated for user: ${userId}`);

      return {
        success: true,
        passwordChangedAt: user.security.passwordChangedAt,
      };
    } catch (error) {
      console.error("❌ Error updating password:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update login information
   * @param {string} userId - User ID
   * @param {Object} loginData - Login data
   * @returns {Promise<Object>} Updated user
   */
  async updateLoginInfo(userId, loginData = {}) {
    try {
      const { ipAddress, userAgent } = loginData;

      const updateData = {
        "security.lastLoginAt": new Date(),
        "security.loginAttempts": 0,
      };

      if (ipAddress) {
        updateData["security.lastLoginIP"] = ipAddress;
      }

      // Reset lock if exists
      const user = await this.model.findByIdAndUpdate(
        userId,
        {
          $set: updateData,
          $unset: { "security.lockUntil": 1 },
        },
        {
          new: true,
          select: this.defaultSelect,
        }
      );

      await this.logActivity(userId, "user_login", {
        ipAddress,
        userAgent: userAgent?.substring(0, 100), // Limit length
      });

      return user;
    } catch (error) {
      console.error("❌ Error updating login info:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Increment login attempts
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async incrementLoginAttempts(userId) {
    try {
      const user = await this.model.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await user.incrementLoginAttempts();

      console.log(`⚠️ Login attempt failed for user: ${userId}`);
      return { attempts: user.security?.loginAttempts || 0 };
    } catch (error) {
      console.error("❌ Error incrementing login attempts:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify email
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async verifyEmail(userId) {
    try {
      const user = await this.model.findByIdAndUpdate(
        userId,
        {
          $set: {
            "verification.emailVerified": true,
            "verification.emailVerifiedAt": new Date(),
            status: "active", // Auto activate sau khi verify
          },
        },
        {
          new: true,
          select: this.defaultSelect,
        }
      );

      if (!user) {
        throw new Error("User not found");
      }

      await this.logActivity(userId, "email_verified");
      console.log(`✅ Email verified for user: ${userId}`);

      return user;
    } catch (error) {
      console.error("❌ Error verifying email:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update portfolio data
   * @param {string} userId - User ID
   * @param {string} action - Action type
   * @param {string} portfolioId - Portfolio ID
   * @returns {Promise<Object>} Updated user
   */
  async updatePortfolio(userId, action, portfolioId) {
    try {
      let updateOperation = {};

      switch (action) {
        case "add_owned":
          updateOperation = {
            $addToSet: { "portfolios.owned": portfolioId },
            $inc: { "portfolioStats.totalPortfolios": 1 },
          };
          break;
        case "remove_owned":
          updateOperation = {
            $pull: { "portfolios.owned": portfolioId },
            $inc: { "portfolioStats.totalPortfolios": -1 },
          };
          break;
        case "add_favorite":
          updateOperation = {
            $addToSet: { "portfolios.favorites": portfolioId },
          };
          break;
        case "remove_favorite":
          updateOperation = {
            $pull: { "portfolios.favorites": portfolioId },
          };
          break;
        case "add_wishlist":
          updateOperation = {
            $addToSet: { "portfolios.wishlist": portfolioId },
          };
          break;
        case "remove_wishlist":
          updateOperation = {
            $pull: { "portfolios.wishlist": portfolioId },
          };
          break;
        default:
          throw new Error(`Invalid portfolio action: ${action}`);
      }

      const user = await this.model.findByIdAndUpdate(userId, updateOperation, {
        new: true,
        select: this.defaultSelect,
      });

      if (!user) {
        throw new Error("User not found");
      }

      await this.logActivity(userId, "portfolio_updated", {
        action,
        portfolioId,
      });
      return user;
    } catch (error) {
      console.error("❌ Error updating portfolio:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update portfolio statistics
   * @param {string} userId - User ID
   * @param {Object} stats - Statistics to update
   * @returns {Promise<Object>} Updated user
   */
  async updatePortfolioStats(userId, stats) {
    try {
      const updateData = {};

      Object.keys(stats).forEach((key) => {
        updateData[`portfolioStats.${key}`] = stats[key];
      });

      const user = await this.model.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
          new: true,
          select: this.defaultSelect,
        }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("❌ Error updating portfolio stats:", error);
      throw this.handleError(error);
    }
  }

  // ===== DELETE OPERATIONS =====

  /**
   * Soft delete user
   * @param {string} userId - User ID
   * @param {string} deletedBy - Who deleted
   * @param {string} reason - Delete reason
   * @returns {Promise<Object>} Delete result
   */
  async softDelete(userId, updatedBy = null, reason = null) {
    try {
      const user = await this.model.findByIdAndUpdate(
        userId,
        {
          $set: {
            updatedAt: new Date(),
            updatedBy,
            status: "inactive",
          },
        },
        {
          new: true,
          select: this.defaultSelect,
        }
      );

      if (!user) {
        throw new Error("User not found");
      }

      await this.logActivity(userId, "user_deleted", { updatedBy, reason });
      console.log(`🗑️ Soft deleted user: ${userId}`);

      return user;
    } catch (error) {
      console.error("❌ Error soft deleting user:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Restore soft deleted user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Restored user
   */
  async restore(userId) {
    try {
      const user = await this.model.findByIdAndUpdate(
        userId,
        {
          $unset: { updatedAt: 1, updatedBy: 1 },
          $set: { status: STATUS.ACTIVE },
        },
        {
          new: true,
          select: this.defaultSelect,
        }
      );

      if (!user) {
        throw new Error("User not found");
      }

      await this.logActivity(userId, "user_restored");
      console.log(`♻️ Restored user: ${userId}`);

      return user;
    } catch (error) {
      console.error("❌ Error restoring user:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Hard delete user (DANGEROUS)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async hardDelete(userId) {
    try {
      const result = await this.model.deleteOne({ _id: userId });

      if (result.deletedCount === 0) {
        throw new Error("User not found");
      }

      console.warn(`💀 Hard deleted user: ${userId}`);
      return { deleted: true, userId };
    } catch (error) {
      console.error("❌ Error hard deleting user:", error);
      throw this.handleError(error);
    }
  }

  // ===== ANALYTICS & STATISTICS =====

  /**
   * Get user statistics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const matchStage = {
        updatedAt: null,
        ...filters,
      };

      const stats = await this.model.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            verified: {
              $sum: {
                $cond: [{ $eq: ["$verification.emailVerified", true] }, 1, 0],
              },
            },
            sellers: {
              $sum: { $cond: [{ $in: ["SELLER", "$roles"] }, 1, 0] },
            },
            admins: {
              $sum: { $cond: [{ $in: ["ADMIN", "$roles"] }, 1, 0] },
            },
            avgPortfolios: { $avg: "$portfolioStats.totalPortfolios" },
            totalPortfolios: { $sum: "$portfolioStats.totalPortfolios" },
          },
        },
      ]);

      return (
        stats[0] || {
          total: 0,
          active: 0,
          verified: 0,
          sellers: 0,
          admins: 0,
          avgPortfolios: 0,
          totalPortfolios: 0,
        }
      );
    } catch (error) {
      console.error("❌ Error getting statistics:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get registration trends
   * @param {number} days - Number of days
   * @returns {Promise<Array>} Registration trends
   */
  async getRegistrationTrends(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await this.model.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            updatedAt: null,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
            verified: {
              $sum: {
                $cond: [{ $eq: ["$verification.emailVerified", true] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return trends;
    } catch (error) {
      console.error("❌ Error getting registration trends:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get top sellers
   * @param {number} limit - Number of sellers
   * @returns {Promise<Array>} Top sellers
   */
  async getTopSellers(limit = 10) {
    try {
      const sellers = await this.model
        .find({
          roles: "SELLER",
          status: "active",
          updatedAt: null,
        })
        .select("name email profile.avatar portfolioStats")
        .sort({
          "portfolioStats.totalPortfolios": -1,
          "portfolioStats.averageRating": -1,
        })
        .limit(limit)
        .lean();

      return sellers;
    } catch (error) {
      console.error("❌ Error getting top sellers:", error);
      throw this.handleError(error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @param {string} excludeUserId - User ID to exclude
   * @returns {Promise<boolean>} Email exists
   */
  async emailExists(email, excludeUserId = null) {
    try {
      const query = {
        email: email.toLowerCase(),
        updatedAt: null,
      };

      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }

      const count = await this.model.countDocuments(query);
      return count > 0;
    } catch (error) {
      console.error("❌ Error checking email existence:", error);
      return false;
    }
  }

  /**
   * Count users
   * @param {Object} query - Query filter
   * @returns {Promise<number>} Count
   */
  async count(query = {}) {
    try {
      const finalQuery = {
        updatedAt: null,
        ...query,
      };
      return await this.model.countDocuments(finalQuery);
    } catch (error) {
      console.error("❌ Error counting users:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Log user activity
   * @param {string} userId - User ID
   * @param {string} action - Action type
   * @param {Object} details - Action details
   * @returns {Promise<void>}
   */
  async logActivity(userId, action, details = {}) {
    try {
      // Implement activity logging (could be separate collection)
      console.log(`📝 User Activity: ${userId} - ${action}`, details);

      // Could save to UserActivity collection:
      // await UserActivity.create({
      //     user: userId,
      //     action,
      //     details,
      //     timestamp: new Date(),
      //     ipAddress: details.ipAddress
      // });
    } catch (error) {
      console.error("❌ Error logging activity:", error);
      // Don't throw - activity logging is non-critical
    }
  }

  /**
   * Bulk operations
   * @param {Array} operations - Array of operations
   * @returns {Promise<Object>} Bulk result
   */
  async bulkWrite(operations) {
    try {
      const result = await this.model.bulkWrite(operations);
      console.log(`📦 User bulk operation: ${result.modifiedCount} modified`);
      return result;
    } catch (error) {
      console.error("❌ Error in bulk operation:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Compare password
   * @param {string} userId - User ID
   * @param {string} password - Password to compare
   * @returns {Promise<boolean>} Password matches
   */
  async comparePassword(userId, password) {
    try {
      const user = await this.model.findById(userId).select("password");

      if (!user) {
        return false;
      }

      return await user.comparePassword(password);
    } catch (error) {
      console.error("❌ Error comparing password:", error);
      return false;
    }
  }

  /**
   * Error handler
   * @param {Error} error - Original error
   * @returns {Error} Processed error
   */
  handleError(error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return new Error(`Validation Error: ${messages.join(", ")}`);
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return new Error(`Duplicate ${field}: This ${field} already exists`);
    }
    if (error.name === "CastError") {
      return new Error("Invalid ID format");
    }
    return error;
  }
}

module.exports = new UserRepository();
