"use strict";

const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repo");
const keyTokenRepository = require("../repositories/keyToken.repo");
const { getRedisHelper } = require("../helpers/redisHelper");

/**
 * Authentication Middleware
 * JWT verification, role-based access control, và security features
 */
class AuthMiddleware {
  constructor() {
    this.redis = getRedisHelper();
    this.tokenBlacklist = new Set(); // In-memory blacklist for quick checks
  }

  /**
   * Main authentication middleware
   * Verify JWT token và populate user info
   */
  authenticate = async (req, res, next) => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        return this.unauthorizedResponse(res, "Access token required");
      }

      // Check blacklist
      if (await this.isTokenBlacklisted(token)) {
        return this.unauthorizedResponse(res, "Token has been revoked");
      }

      // Decode token để lấy keyId
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.keyId) {
        return this.unauthorizedResponse(res, "Invalid token format");
      }

      // Get public key từ keyToken
      const keyToken = await keyTokenRepository.findById(decoded.keyId, {
        includePrivateKey: false,
      });

      if (!keyToken || !keyToken.security?.isActive) {
        return this.unauthorizedResponse(
          res,
          "Token key not found or inactive"
        );
      }

      // Verify JWT với public key
      const payload = jwt.verify(token, keyToken.keys.publicKey, {
        algorithms: ["RS256"],
        issuer: process.env.JWT_ISSUER || "portfolio-marketplace",
        audience: process.env.JWT_AUDIENCE || "portfolio-api",
      });

      // Get user info
      const user = await userRepository.findById(payload.userId, {
        includeSensitive: false,
      });

      if (!user) {
        return this.unauthorizedResponse(res, "User not found");
      }

      console.log("user: ", user);

      // Check user status
      if (user.status !== "active") {
        return this.unauthorizedResponse(res, "Account is not active");
      }

      // Check if user is locked
      if (user.security?.lockUntil && user.security.lockUntil > Date.now()) {
        return this.unauthorizedResponse(res, "Account is temporarily locked");
      }

      // Update token usage
      await keyTokenRepository.updateUsage(keyToken._id, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // Attach user và token info to request
      req.user = user;
      req.token = {
        payload,
        keyId: keyToken._id,
        accessToken: token,
      };

      // Log successful authentication (dev only)
      if (process.env.NODE_ENV === "dev") {
        console.log(`🔐 Authenticated user: ${user.email} (${user._id})`);
      }

      next();
    } catch (error) {
      console.error("❌ Authentication error:", error);

      if (error.name === "JsonWebTokenError") {
        return this.unauthorizedResponse(res, "Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        return this.unauthorizedResponse(res, "Token expired");
      }
      if (error.name === "NotBeforeError") {
        return this.unauthorizedResponse(res, "Token not active");
      }

      return this.unauthorizedResponse(res, "Authentication failed");
    }
  };

  /**
   * Optional authentication - không require token
   * Populate user nếu có valid token
   */
  optionalAuth = async (req, res, next) => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        // No token, continue without user
        req.user = null;
        return next();
      }

      // Try to authenticate
      await this.authenticate(req, res, (error) => {
        if (error) {
          // Authentication failed, continue without user
          req.user = null;
        }
        next();
      });
    } catch (error) {
      // Failed authentication, continue without user
      req.user = null;
      next();
    }
  };

  /**
   * Role-based authorization middleware
   * @param {string|Array} allowedRoles - Allowed roles
   * @param {Object} options - Authorization options
   */
  authorize = (allowedRoles, options = {}) => {
    return async (req, res, next) => {
      try {
        const {
          requireEmailVerification = false,
          requireTwoFactor = false,
          allowSelfAccess = false,
          resourceIdParam = null,
        } = options;

        // Check if user is authenticated
        if (!req.user) {
          return this.forbiddenResponse(res, "Authentication required");
        }

        const userRoles = req.user.roles || [];
        const rolesArray = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];

        // Check role permissions
        const hasRole = rolesArray.some((role) => userRoles.includes(role));

        // Check self access (user accessing their own resources)
        let hasSelfAccess = false;
        if (allowSelfAccess && resourceIdParam) {
          const resourceId = req.params[resourceIdParam];
          hasSelfAccess = resourceId === req.user._id.toString();
        }

        if (!hasRole && !hasSelfAccess) {
          return this.forbiddenResponse(res, "Insufficient permissions");
        }

        // Check email verification
        if (requireEmailVerification && !req.user.verification?.emailVerified) {
          return this.forbiddenResponse(res, "Email verification required");
        }

        // Check two-factor authentication
        if (requireTwoFactor && !req.user.verification?.twoFactorEnabled) {
          return this.forbiddenResponse(
            res,
            "Two-factor authentication required"
          );
        }

        // Log authorization (dev only)
        if (process.env.NODE_ENV === "dev") {
          console.log(
            `🛡️ Authorized user: ${req.user.email} for roles: ${rolesArray.join(", ")}`
          );
        }

        next();
      } catch (error) {
        console.error("❌ Authorization error:", error);
        return this.forbiddenResponse(res, "Authorization failed");
      }
    };
  };

  /**
   * Admin-only middleware
   */
  adminOnly = this.authorize(["ADMIN"], {
    requireEmailVerification: true,
  });

  /**
   * Manager or Admin middleware
   */
  managerOrAdmin = this.authorize(["MANAGER", "ADMIN"], {
    requireEmailVerification: true,
  });

  /**
   * Seller authorization
   */
  sellerAuth = this.authorize(["SELLER", "ADMIN"], {
    requireEmailVerification: true,
    allowSelfAccess: true,
    resourceIdParam: "userId",
  });

  /**
   * Owner or Admin access (for user resources)
   */
  ownerOrAdmin = this.authorize(["ADMIN"], {
    allowSelfAccess: true,
    resourceIdParam: "userId",
  });

  /**
   * Verified users only
   */
  verifiedOnly = async (req, res, next) => {
    if (!req.user) {
      return this.unauthorizedResponse(res, "Authentication required");
    }

    if (!req.user.verification?.emailVerified) {
      return this.forbiddenResponse(res, "Email verification required");
    }

    next();
  };

  /**
   * Rate limiting per user
   * @param {Object} options - Rate limit options
   */
  userRateLimit = (options = {}) => {
    const {
      windowMs = 60000, // 1 minute
      maxRequests = 100,
      skipSuccessfulRequests = false,
    } = options;

    return async (req, res, next) => {
      if (!req.user) {
        return next(); // Skip if no user
      }

      try {
        const cacheKey = `user_rate_limit:${req.user._id}:${Math.floor(Date.now() / windowMs)}`;

        await this.redis.connect();
        const currentCount = (await this.redis.get(cacheKey)) || 0;

        if (parseInt(currentCount) >= maxRequests) {
          return res.status(429).json({
            error: "Rate limit exceeded",
            message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
            retryAfter: Math.ceil(windowMs / 1000),
          });
        }

        // Increment counter
        await this.redis.incr(cacheKey);
        await this.redis.expire(cacheKey, Math.ceil(windowMs / 1000));

        next();
      } catch (error) {
        console.error("❌ User rate limit error:", error);
        next(); // Continue on error
      }
    };
  };

  /**
   * API Key authentication (cho public APIs)
   * @param {Object} options - API key options
   */
  apiKeyAuth = (options = {}) => {
    const { required = true, adminOnly = false } = options;

    return async (req, res, next) => {
      try {
        const apiKey = req.headers["x-api-key"] || req.query.apiKey;

        if (!apiKey) {
          if (required) {
            return this.unauthorizedResponse(res, "API key required");
          }
          return next();
        }

        // Validate API key (implement your logic)
        const isValid = await this.validateApiKey(apiKey);
        const keyData = await this.getApiKeyData(apiKey);

        if (!isValid || !keyData) {
          return this.unauthorizedResponse(res, "Invalid API key");
        }

        if (adminOnly && !keyData.isAdmin) {
          return this.forbiddenResponse(res, "Admin API key required");
        }

        // Attach API key info
        req.apiKey = keyData;

        next();
      } catch (error) {
        console.error("❌ API key authentication error:", error);
        return this.unauthorizedResponse(res, "API key authentication failed");
      }
    };
  };

  /**
   * Device-based authentication
   * Ensure request comes from registered device
   */
  deviceAuth = async (req, res, next) => {
    try {
      if (!req.user || !req.token) {
        return this.unauthorizedResponse(res, "Authentication required");
      }

      const deviceId = req.headers["x-device-id"];
      if (!deviceId) {
        return this.unauthorizedResponse(res, "Device ID required");
      }

      // Check if token belongs to this device
      const keyToken = await keyTokenRepository.findById(req.token.keyId);

      if (!keyToken || keyToken.session?.deviceId !== deviceId) {
        return this.unauthorizedResponse(res, "Invalid device");
      }

      req.device = {
        id: deviceId,
        type: keyToken.session?.deviceType,
        lastUsed: keyToken.session?.lastUsedAt,
      };

      next();
    } catch (error) {
      console.error("❌ Device authentication error:", error);
      return this.unauthorizedResponse(res, "Device authentication failed");
    }
  };

  /**
   * Session validation middleware
   * Check if session is still valid và active
   */
  validateSession = async (req, res, next) => {
    try {
      if (!req.user || !req.token) {
        return next();
      }

      // Check session in Redis
      const sessionKey = `session:${req.user._id}:${req.token.keyId}`;
      await this.redis.connect();

      const sessionData = await this.redis.get(sessionKey, true);

      if (!sessionData) {
        return this.unauthorizedResponse(res, "Session expired");
      }

      // Update session last activity
      sessionData.lastActivity = Date.now();
      await this.redis.set(sessionKey, sessionData, { ttl: 86400 }); // 24 hours

      req.session = sessionData;
      next();
    } catch (error) {
      console.error("❌ Session validation error:", error);
      next(); // Continue on error
    }
  };

  /**
   * Security headers middleware
   */
  securityHeaders = (req, res, next) => {
    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

    // Remove server info
    res.removeHeader("X-Powered-By");

    next();
  };

  /**
   * CORS middleware with authentication awareness
   */
  corsAuth = (options = {}) => {
    const {
      allowedOrigins = ["http://localhost:3000"],
      allowCredentials = true,
    } = options;

    return (req, res, next) => {
      const origin = req.headers.origin;

      // Check if origin is allowed
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      }

      if (allowCredentials) {
        res.header("Access-Control-Allow-Credentials", "true");
      }

      res.header(
        "Access-Control-Allow-Methods",
        "GET,PUT,POST,DELETE,OPTIONS,PATCH"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept,Authorization,X-Device-ID,X-API-Key"
      );

      if (req.method === "OPTIONS") {
        return res.sendStatus(200);
      }

      next();
    };
  };

  // ===== UTILITY METHODS =====

  /**
   * Extract token từ request
   * @param {Object} req - Express request object
   * @returns {string|null} Token string
   */
  extractToken(req) {
    // Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Query parameter
    if (req.query.token) {
      return req.query.token;
    }

    // Cookie
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }

    return null;
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} Is blacklisted
   */
  async isTokenBlacklisted(token) {
    try {
      // Check in-memory cache first
      if (this.tokenBlacklist.has(token)) {
        return true;
      }

      // Check in Redis
      await this.redis.connect();
      const blacklisted = await this.redis.exists(`blacklist:${token}`);

      if (blacklisted) {
        this.tokenBlacklist.add(token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Error checking token blacklist:", error);
      return false; // Fail open
    }
  }

  /**
   * Add token to blacklist
   * @param {string} token - JWT token
   * @param {number} expirySeconds - Expiry in seconds
   */
  async blacklistToken(token, expirySeconds = 3600) {
    try {
      await this.redis.connect();
      await this.redis.set(`blacklist:${token}`, "1", { ttl: expirySeconds });
      this.tokenBlacklist.add(token);

      console.log(`🚫 Token blacklisted for ${expirySeconds} seconds`);
    } catch (error) {
      console.error("❌ Error blacklisting token:", error);
    }
  }

  /**
   * Validate API key
   * @param {string} apiKey - API key
   * @returns {Promise<boolean>} Is valid
   */
  async validateApiKey(apiKey) {
    try {
      // Implement your API key validation logic
      // Could check database, Redis, or external service

      // Simple validation for demo
      const validKeys = process.env.VALID_API_KEYS?.split(",") || [];
      return validKeys.includes(apiKey);
    } catch (error) {
      console.error("❌ Error validating API key:", error);
      return false;
    }
  }

  /**
   * Get API key data
   * @param {string} apiKey - API key
   * @returns {Promise<Object|null>} API key data
   */
  async getApiKeyData(apiKey) {
    try {
      // Return API key metadata
      return {
        key: apiKey,
        isAdmin: apiKey.startsWith("admin_"),
        permissions: ["read", "write"],
        rateLimit: 1000,
      };
    } catch (error) {
      console.error("❌ Error getting API key data:", error);
      return null;
    }
  }

  /**
   * Unauthorized response
   */
  unauthorizedResponse(res, message = "Unauthorized") {
    return res.status(401).json({
      error: "Unauthorized",
      message,
      code: "AUTH_REQUIRED",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Forbidden response
   */
  forbiddenResponse(res, message = "Forbidden") {
    return res.status(403).json({
      error: "Forbidden",
      message,
      code: "INSUFFICIENT_PERMISSIONS",
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
module.exports = new AuthMiddleware();
