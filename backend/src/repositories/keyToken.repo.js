"use strict";

const KeyToken = require("../models/Keytoken.model");
const { Types } = require("mongoose");

/**
 * KeyToken Repository
 * Centralized data access layer cho KeyToken operations
 * Implements Repository Pattern với caching và error handling
 */
class KeyTokenRepository {
  constructor() {
    this.model = KeyToken;
    this.defaultPopulate = "user";
    this.defaultSelect = "-keys.privateKey -refreshToken.token";
  }

  // ===== CREATE OPERATIONS =====

  /**
   * Tạo mới key token
   * @param {Object} tokenData - Dữ liệu token
   * @returns {Promise<Object>} Created token
   */
  async create(tokenData) {
    try {
      const keyToken = new this.model(tokenData);
      await keyToken.save();

      // Populate user info
      await keyToken.populate(this.defaultPopulate);
      console.log(`✅ Created new key token for user: ${keyToken.user._id}`);
      return keyToken;
    } catch (error) {
      console.error("❌ Error creating key token:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Tạo token với key pair tự động
   * @param {string} userId - User ID
   * @param {Object} sessionData - Session information
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created token with keys
   */
  async createWithKeyPair(userId, sessionData = {}, options = {}) {
    try {
      const {
        keySize = 2048,
        expiresInDays = 30,
        scope = ["read", "write"],
      } = options;

      const tokenData = {
        user: userId,
        session: {
          deviceType: sessionData.deviceType || "unknown",
          userAgent: sessionData.userAgent,
          ipAddress: sessionData.ipAddress,
          location: sessionData.location || {},
        },
        refreshToken: {
          scope,
        },
        metadata: {
          environment: process.env.NODE_ENV || "development",
        },
      };

      const keyToken = new this.model(tokenData);

      // Generate key pair và refresh token
      keyToken.generateKeyPair(keySize);
      keyToken.generateRefreshToken(expiresInDays);

      await keyToken.save();
      await keyToken.populate(this.defaultPopulate);

      console.log(`🔑 Created token with key pair for user: ${userId}`);

      return {
        keyToken,
        publicKey: keyToken.keys.publicKey,
        refreshToken: keyToken.refreshToken.token,
      };
    } catch (error) {
      console.error("❌ Error creating token with key pair:", error);
      throw this.handleError(error);
    }
  }

  // ===== READ OPERATIONS =====

  /**
   * Tìm token bằng ID
   * @param {string} tokenId - Token ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Token document
   */
  async findById(tokenId, options = {}) {
    try {
      const { includePrivateKey = false, includeInactive = false } = options;

      const query = { _id: tokenId };
      if (!includeInactive) {
        query["security.isActive"] = true;
      }

      let select = this.defaultSelect;
      if (includePrivateKey) {
        select = select.replace("-keys.privateKey", "");
      }

      const token = await this.model
        .findOne(query)
        .select(select)
        .populate(this.defaultPopulate)
        .lean();

      return token;
    } catch (error) {
      console.error("❌ Error finding token by ID:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Tìm token bằng refresh token
   * @param {string} refreshToken - Refresh token string
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Token document
   */
  async findByRefreshToken(refreshToken, options = {}) {
    try {
      const { includeExpired = false, includeRevoked = false } = options;

      const query = {
        "refreshToken.token": refreshToken,
      };

      if (!includeExpired) {
        query["refreshToken.expiresAt"] = { $gt: new Date() };
      }

      if (!includeRevoked) {
        query["security.isActive"] = true;
        query["security.isCompromised"] = false;
      }

      const token = await this.model
        .findOne(query)
        .select(this.defaultSelect)
        .populate(this.defaultPopulate);

      if (token) {
        // Update last access
        await this.updateLastAccess(token._id);
      }

      return token;
    } catch (error) {
      console.error("❌ Error finding token by refresh token:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Lấy tất cả active tokens của user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of tokens
   */
  async findActiveTokensByUser(userId, options = {}) {
    try {
      const {
        limit = 10,
        sortBy = "session.lastUsedAt",
        sortOrder = -1,
        deviceType = null,
      } = options;

      const query = {
        user: userId,
        "security.isActive": true,
        "security.isCompromised": false,
        "refreshToken.expiresAt": { $gt: new Date() },
      };

      if (deviceType) {
        query["session.deviceType"] = deviceType;
      }

      const tokens = await this.model
        .find(query)
        .select(this.defaultSelect)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .populate(this.defaultPopulate)
        .lean();

      return tokens;
    } catch (error) {
      console.error("❌ Error finding active tokens by user:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Tìm token bằng device ID
   * @param {string} userId - User ID
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object|null>} Token document
   */
  async findByUserAndDevice(userId, deviceId) {
    try {
      const token = await this.model
        .findOne({
          user: userId,
          "session.deviceId": deviceId,
          "security.isActive": true,
          "refreshToken.expiresAt": { $gt: new Date() },
        })
        .select(this.defaultSelect)
        .populate(this.defaultPopulate);

      return token;
    } catch (error) {
      console.error("❌ Error finding token by user and device:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Kiểm tra token có tồn tại và valid không
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<boolean>} True if valid
   */
  async isValidToken(refreshToken) {
    try {
      const token = await this.model
        .findOne({
          "refreshToken.token": refreshToken,
          "security.isActive": true,
          "security.isCompromised": false,
          "refreshToken.expiresAt": { $gt: new Date() },
        })
        .select("_id")
        .lean();

      return !!token;
    } catch (error) {
      console.error("❌ Error validating token:", error);
      return false;
    }
  }

  // ===== UPDATE OPERATIONS =====

  /**
   * Refresh token (rotate)
   * @param {string} oldRefreshToken - Current refresh token
   * @param {Object} sessionData - New session data
   * @param {number} expiresInDays - Expiration days
   * @returns {Promise<Object>} New token data
   */
  async refreshToken(oldRefreshToken, sessionData = {}, expiresInDays = 30) {
    try {
      const token = await this.model.findOne({
        "refreshToken.token": oldRefreshToken,
        "security.isActive": true,
        "security.isCompromised": false,
      });

      if (!token) {
        throw new Error("Token not found or invalid");
      }

      if (token.refreshToken.expiresAt <= new Date()) {
        throw new Error("Token expired");
      }

      // Mark old token as used
      await token.markTokenAsUsed({
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
      });

      // Generate new refresh token
      const newRefreshToken = token.generateRefreshToken(expiresInDays);

      // Update session data
      if (sessionData.ipAddress) {
        token.session.ipAddress = sessionData.ipAddress;
      }
      if (sessionData.userAgent) {
        token.session.userAgent = sessionData.userAgent;
      }
      token.session.lastUsedAt = new Date();

      await token.save();
      await token.populate(this.defaultPopulate);

      console.log(`🔄 Token refreshed for user: ${token.user._id}`);

      return {
        keyToken: token,
        newRefreshToken,
        publicKey: token.keys.publicKey,
      };
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update usage statistics
   * @param {string} tokenId - Token ID
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Updated token
   */
  async updateUsage(tokenId, sessionData = {}) {
    try {
      const updateData = {
        $inc: {
          "usage.accessCount": 1,
        },
        $set: {
          "usage.lastAccessAt": new Date(),
          "session.lastUsedAt": new Date(),
        },
      };

      if (sessionData.ipAddress) {
        updateData.$set["session.ipAddress"] = sessionData.ipAddress;
      }
      if (sessionData.userAgent) {
        updateData.$set["session.userAgent"] = sessionData.userAgent;
      }

      const token = await this.model
        .findByIdAndUpdate(tokenId, updateData, { new: true })
        .select(this.defaultSelect)
        .populate(this.defaultPopulate);

      return token;
    } catch (error) {
      console.error("❌ Error updating usage:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update last access time
   * @param {string} tokenId - Token ID
   * @returns {Promise<void>}
   */
  async updateLastAccess(tokenId) {
    try {
      await this.model.findByIdAndUpdate(tokenId, {
        $set: {
          "usage.lastAccessAt": new Date(),
          "session.lastUsedAt": new Date(),
        },
        $inc: {
          "usage.accessCount": 1,
        },
      });
    } catch (error) {
      console.error("❌ Error updating last access:", error);
      // Non-critical operation, don't throw
    }
  }

  /**
   * Extend token expiration
   * @param {string} tokenId - Token ID
   * @param {number} additionalDays - Additional days
   * @returns {Promise<Object>} Updated token
   */
  async extendExpiration(tokenId, additionalDays = 30) {
    try {
      const token = await this.model.findById(tokenId);
      if (!token) {
        throw new Error("Token not found");
      }

      await token.extendExpiration(additionalDays);
      await token.populate(this.defaultPopulate);

      console.log(`⏰ Extended token expiration by ${additionalDays} days`);
      return token;
    } catch (error) {
      console.error("❌ Error extending expiration:", error);
      throw this.handleError(error);
    }
  }

  // ===== DELETE/REVOKE OPERATIONS =====

  /**
   * Revoke single token
   * @param {string} tokenId - Token ID
   * @param {string} reason - Revocation reason
   * @param {string} revokedBy - Who revoked it
   * @returns {Promise<Object>} Revoked token
   */
  async revokeToken(tokenId, reason = "user_logout", revokedBy = null) {
    try {
      const token = await this.model.findById(tokenId);
      if (!token) {
        throw new Error("Token not found");
      }

      await token.revokeToken(reason, revokedBy);
      await token.populate(this.defaultPopulate);

      console.log(`🚫 Token revoked: ${tokenId}, reason: ${reason}`);
      return token;
    } catch (error) {
      console.error("❌ Error revoking token:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Revoke token by refresh token
   * @param {string} refreshToken - Refresh token
   * @param {string} reason - Revocation reason
   * @returns {Promise<Object>} Revoked token
   */
  async revokeByRefreshToken(refreshToken, reason = "user_logout") {
    try {
      const token = await this.model.findOne({
        "refreshToken.token": refreshToken,
        "security.isActive": true,
      });

      if (!token) {
        throw new Error("Token not found");
      }

      await token.revokeToken(reason);
      await token.populate(this.defaultPopulate);

      console.log(`🚫 Token revoked by refresh token, reason: ${reason}`);
      return token;
    } catch (error) {
      console.error("❌ Error revoking token by refresh token:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Revoke all tokens của user
   * @param {string} userId - User ID
   * @param {string} reason - Revocation reason
   * @param {string} exceptTokenId - Token ID to exclude
   * @returns {Promise<Object>} Revocation result
   */
  async revokeAllUserTokens(
    userId,
    reason = "security_action",
    exceptTokenId = null
  ) {
    try {
      const query = {
        user: userId,
        "security.isActive": true,
      };

      if (exceptTokenId) {
        query._id = { $ne: exceptTokenId };
      }

      const result = await this.model.updateMany(query, {
        $set: {
          "security.isActive": false,
          "security.revokedAt": new Date(),
          "security.revokedReason": reason,
        },
      });

      console.log(
        `🚫 Revoked ${result.modifiedCount} tokens for user: ${userId}`
      );
      return {
        revokedCount: result.modifiedCount,
        reason,
      };
    } catch (error) {
      console.error("❌ Error revoking all user tokens:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark token as compromised
   * @param {string} tokenId - Token ID
   * @param {Object} details - Compromise details
   * @returns {Promise<Object>} Updated token
   */
  async markAsCompromised(tokenId, details = {}) {
    try {
      const token = await this.model.findById(tokenId);
      if (!token) {
        throw new Error("Token not found");
      }

      await token.markAsCompromised(details);
      await token.populate(this.defaultPopulate);

      console.warn(`⚠️ Token marked as compromised: ${tokenId}`);
      return token;
    } catch (error) {
      console.error("❌ Error marking token as compromised:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Hard delete expired tokens
   * @param {number} olderThanDays - Delete tokens older than X days
   * @returns {Promise<Object>} Deletion result
   */
  async deleteExpiredTokens(olderThanDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.model.deleteMany({
        $or: [
          { "refreshToken.expiresAt": { $lte: new Date() } },
          { "security.revokedAt": { $lte: cutoffDate } },
        ],
      });

      console.log(`🗑️ Deleted ${result.deletedCount} expired tokens`);
      return {
        deletedCount: result.deletedCount,
        cutoffDate,
      };
    } catch (error) {
      console.error("❌ Error deleting expired tokens:", error);
      throw this.handleError(error);
    }
  }

  // ===== ANALYTICS & REPORTING =====

  /**
   * Get token statistics
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(userId = null) {
    try {
      const matchStage = userId
        ? { $match: { user: new Types.ObjectId(userId) } }
        : { $match: {} };

      const stats = await this.model.aggregate([
        matchStage,
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$security.isActive", true] },
                      { $gt: ["$refreshToken.expiresAt", new Date()] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            expired: {
              $sum: {
                $cond: [
                  { $lte: ["$refreshToken.expiresAt", new Date()] },
                  1,
                  0,
                ],
              },
            },
            revoked: {
              $sum: {
                $cond: [{ $ne: ["$security.revokedAt", null] }, 1, 0],
              },
            },
            compromised: {
              $sum: {
                $cond: [{ $eq: ["$security.isCompromised", true] }, 1, 0],
              },
            },
            avgUsage: { $avg: "$usage.accessCount" },
            totalUsage: { $sum: "$usage.accessCount" },
          },
        },
      ]);

      return (
        stats[0] || {
          total: 0,
          active: 0,
          expired: 0,
          revoked: 0,
          compromised: 0,
          avgUsage: 0,
          totalUsage: 0,
        }
      );
    } catch (error) {
      console.error("❌ Error getting statistics:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Find suspicious tokens
   * @param {Object} criteria - Suspicious criteria
   * @returns {Promise<Array>} Suspicious tokens
   */
  async findSuspiciousTokens(criteria = {}) {
    try {
      const {
        highUsageThreshold = 1000,
        inactiveDays = 7,
        multipleDeviceThreshold = 5,
      } = criteria;

      const inactiveDate = new Date();
      inactiveDate.setDate(inactiveDate.getDate() - inactiveDays);

      const suspicious = await this.model
        .find({
          "security.isActive": true,
          $or: [
            { "usage.accessCount": { $gt: highUsageThreshold } },
            { "security.suspiciousActivity.0": { $exists: true } },
            {
              "session.lastUsedAt": { $lt: inactiveDate },
              "usage.accessCount": { $gt: 100 },
            },
          ],
        })
        .select(this.defaultSelect)
        .populate(this.defaultPopulate)
        .sort({ "usage.accessCount": -1 })
        .limit(50);

      return suspicious;
    } catch (error) {
      console.error("❌ Error finding suspicious tokens:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get device statistics cho user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Device statistics
   */
  async getUserDeviceStats(userId) {
    try {
      const deviceStats = await this.model.aggregate([
        { $match: { user: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$session.deviceType",
            count: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ["$security.isActive", true] }, 1, 0],
              },
            },
            lastUsed: { $max: "$session.lastUsedAt" },
            totalUsage: { $sum: "$usage.accessCount" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return deviceStats;
    } catch (error) {
      console.error("❌ Error getting device statistics:", error);
      throw this.handleError(error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Bulk operations
   * @param {Array} operations - Array of operations
   * @returns {Promise<Object>} Bulk result
   */
  async bulkWrite(operations) {
    try {
      const result = await this.model.bulkWrite(operations);
      console.log(
        `📦 Bulk operation completed: ${result.modifiedCount} modified`
      );
      return result;
    } catch (error) {
      console.error("❌ Error in bulk operation:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Count tokens
   * @param {Object} query - Query filter
   * @returns {Promise<number>} Count
   */
  async count(query = {}) {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      console.error("❌ Error counting tokens:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if user has active tokens
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Has active tokens
   */
  async hasActiveTokens(userId) {
    try {
      const count = await this.count({
        user: userId,
        "security.isActive": true,
        "refreshToken.expiresAt": { $gt: new Date() },
      });
      return count > 0;
    } catch (error) {
      console.error("❌ Error checking active tokens:", error);
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
      return new Error(
        `Validation Error: ${Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    if (error.code === 11000) {
      return new Error("Duplicate key error: Token already exists");
    }
    if (error.name === "CastError") {
      return new Error("Invalid ID format");
    }
    return error;
  }
}

module.exports = new KeyTokenRepository();
