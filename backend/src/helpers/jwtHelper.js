"use strict";

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * JWT Helper
 * Comprehensive JWT operations với RSA key management
 * Support access tokens, refresh tokens, và custom tokens
 */
class JWTHelper {
    constructor(options = {}) {
        this.defaultOptions = {
            algorithm: 'RS256',
            issuer: process.env.JWT_ISSUER || 'portfolio-marketplace',
            audience: process.env.JWT_AUDIENCE || 'portfolio-api',
            accessTokenExpiry: '1h',
            refreshTokenExpiry: '30d',
            keySize: 2048
        };

        this.options = { ...this.defaultOptions, ...options };

        // In-memory key cache
        this.keyCache = new Map();

        console.log(`🔑 JWT Helper initialized with algorithm: ${this.options.algorithm}`);
    }

    // ===== KEY PAIR GENERATION =====

    /**
     * Generate RSA key pair
     * @param {number} keySize - Key size in bits (2048, 4096)
     * @returns {Object} Key pair object
     */
    generateKeyPair(keySize = this.options.keySize) {
        try {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: keySize,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            });

            console.log(`🔐 Generated ${keySize}-bit RSA key pair`);

            return {
                publicKey,
                privateKey,
                keySize,
                algorithm: this.options.algorithm,
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error generating key pair:', error);
            throw new Error('Failed to generate RSA key pair');
        }
    }

    /**
     * Load key pair from files
     * @param {string} publicKeyPath - Path to public key file
     * @param {string} privateKeyPath - Path to private key file
     * @returns {Object} Key pair object
     */
    loadKeyPairFromFiles(publicKeyPath, privateKeyPath) {
        try {
            const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

            return {
                publicKey,
                privateKey,
                source: 'file',
                publicKeyPath,
                privateKeyPath
            };
        } catch (error) {
            console.error('❌ Error loading key pair from files:', error);
            throw new Error('Failed to load key pair from files');
        }
    }

    /**
     * Save key pair to files
     * @param {Object} keyPair - Key pair object
     * @param {string} directory - Directory to save keys
     * @param {string} prefix - File prefix
     */
    saveKeyPairToFiles(keyPair, directory = './keys', prefix = 'jwt') {
        try {
            // Create directory if not exists
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            const publicKeyPath = path.join(directory, `${prefix}_public.pem`);
            const privateKeyPath = path.join(directory, `${prefix}_private.pem`);

            fs.writeFileSync(publicKeyPath, keyPair.publicKey);
            fs.writeFileSync(privateKeyPath, keyPair.privateKey, { mode: 0o600 }); // Private key with restricted permissions

            console.log(`💾 Key pair saved to ${directory}`);

            return { publicKeyPath, privateKeyPath };
        } catch (error) {
            console.error('❌ Error saving key pair:', error);
            throw new Error('Failed to save key pair to files');
        }
    }

    // ===== TOKEN GENERATION =====

    /**
     * Generate Access Token
     * @param {Object} payload - Token payload
     * @param {string} privateKey - Private key for signing
     * @param {Object} options - Token options
     * @returns {string} JWT access token
     */
    generateAccessToken(payload, privateKey, options = {}) {
        try {
            const tokenOptions = {
                algorithm: this.options.algorithm,
                expiresIn: options.expiresIn || this.options.accessTokenExpiry,
                issuer: this.options.issuer,
                audience: this.options.audience,
                subject: payload.userId || payload.sub,
                jwtid: this.generateJTI(),
                ...options
            };

            // Add standard claims
            const enhancedPayload = {
                ...payload,
                type: 'access',
                iat: Math.floor(Date.now() / 1000),
                scope: payload.scope || this.getDefaultScope(payload.roles)
            };

            const token = jwt.sign(enhancedPayload, privateKey, tokenOptions);

            console.log(`🎫 Generated access token for user: ${payload.userId}`);
            return token;
        } catch (error) {
            console.error('❌ Error generating access token:', error);
            throw new Error('Failed to generate access token');
        }
    }

    /**
     * Generate Refresh Token
     * @param {Object} payload - Token payload
     * @param {string} privateKey - Private key for signing
     * @param {Object} options - Token options
     * @returns {string} JWT refresh token
     */
    generateRefreshToken(payload, privateKey, options = {}) {
        try {
            const tokenOptions = {
                algorithm: this.options.algorithm,
                expiresIn: options.expiresIn || this.options.refreshTokenExpiry,
                issuer: this.options.issuer,
                audience: this.options.audience,
                subject: payload.userId || payload.sub,
                jwtid: this.generateJTI(),
                ...options
            };

            // Minimal payload for refresh token
            const enhancedPayload = {
                userId: payload.userId,
                keyId: payload.keyId,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000)
            };

            const token = jwt.sign(enhancedPayload, privateKey, tokenOptions);

            console.log(`🔄 Generated refresh token for user: ${payload.userId}`);
            return token;
        } catch (error) {
            console.error('❌ Error generating refresh token:', error);
            throw new Error('Failed to generate refresh token');
        }
    }

    /**
     * Generate Custom Token
     * @param {Object} payload - Token payload
     * @param {string} privateKey - Private key for signing
     * @param {Object} options - Token options
     * @returns {string} JWT custom token
     */
    generateCustomToken(payload, privateKey, options = {}) {
        try {
            const tokenOptions = {
                algorithm: this.options.algorithm,
                issuer: this.options.issuer,
                audience: this.options.audience,
                jwtid: this.generateJTI(),
                ...options
            };

            const token = jwt.sign(payload, privateKey, tokenOptions);

            console.log(`🎯 Generated custom token: ${payload.type || 'unknown'}`);
            return token;
        } catch (error) {
            console.error('❌ Error generating custom token:', error);
            throw new Error('Failed to generate custom token');
        }
    }

    /**
     * Generate Token Pair (Access + Refresh)
     * @param {Object} user - User object
     * @param {string} privateKey - Private key for signing
     * @param {string} keyId - Key ID reference
     * @param {Object} options - Token options
     * @returns {Object} Token pair
     */
    generateTokenPair(user, privateKey, keyId, options = {}) {
        try {
            const basePayload = {
                userId: user._id || user.id,
                email: user.email,
                roles: user.roles || [],
                keyId,
                verified: user.verification?.emailVerified || false
            };

            const accessToken = this.generateAccessToken(basePayload, privateKey, {
                expiresIn: options.accessTokenExpiry
            });

            const refreshToken = this.generateRefreshToken({
                userId: basePayload.userId,
                keyId
            }, privateKey, {
                expiresIn: options.refreshTokenExpiry
            });

            return {
                accessToken,
                refreshToken,
                tokenType: 'Bearer',
                expiresIn: this.parseExpiry(options.accessTokenExpiry || this.options.accessTokenExpiry),
                scope: this.getDefaultScope(user.roles)
            };
        } catch (error) {
            console.error('❌ Error generating token pair:', error);
            throw new Error('Failed to generate token pair');
        }
    }

    // ===== TOKEN VERIFICATION =====

    /**
     * Verify Token
     * @param {string} token - JWT token to verify
     * @param {string} publicKey - Public key for verification
     * @param {Object} options - Verification options
     * @returns {Object} Decoded payload
     */
    verifyToken(token, publicKey, options = {}) {
        try {
            const verifyOptions = {
                algorithms: [this.options.algorithm],
                issuer: this.options.issuer,
                audience: this.options.audience,
                clockTolerance: 30, // 30 seconds clock skew tolerance
                ...options
            };

            const decoded = jwt.verify(token, publicKey, verifyOptions);

            // Additional validation
            this.validateTokenClaims(decoded);

            console.log(`✅ Token verified for user: ${decoded.userId}`);
            return decoded;
        } catch (error) {
            console.error('❌ Token verification failed:', error.message);
            throw this.handleVerificationError(error);
        }
    }

    /**
     * Verify Access Token
     * @param {string} token - Access token
     * @param {string} publicKey - Public key
     * @returns {Object} Decoded payload
     */
    verifyAccessToken(token, publicKey) {
        try {
            const decoded = this.verifyToken(token, publicKey);

            if (decoded.type !== 'access') {
                throw new Error('Invalid token type for access token');
            }

            return decoded;
        } catch (error) {
            throw new Error(`Access token verification failed: ${error.message}`);
        }
    }

    /**
     * Verify Refresh Token
     * @param {string} token - Refresh token
     * @param {string} publicKey - Public key
     * @returns {Object} Decoded payload
     */
    verifyRefreshToken(token, publicKey) {
        try {
            const decoded = this.verifyToken(token, publicKey);

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type for refresh token');
            }

            return decoded;
        } catch (error) {
            throw new Error(`Refresh token verification failed: ${error.message}`);
        }
    }

    // ===== TOKEN DECODING =====

    /**
     * Decode Token without verification
     * @param {string} token - JWT token
     * @returns {Object} Decoded token
     */
    decodeToken(token) {
        try {
            const decoded = jwt.decode(token, { complete: true });

            if (!decoded) {
                throw new Error('Invalid token format');
            }

            return {
                header: decoded.header,
                payload: decoded.payload,
                signature: decoded.signature
            };
        } catch (error) {
            console.error('❌ Token decode error:', error);
            throw new Error('Failed to decode token');
        }
    }

    /**
     * Get Token Info
     * @param {string} token - JWT token
     * @returns {Object} Token information
     */
    getTokenInfo(token) {
        try {
            const decoded = this.decodeToken(token);
            const payload = decoded.payload;

            return {
                header: decoded.header,
                userId: payload.userId || payload.sub,
                email: payload.email,
                roles: payload.roles,
                type: payload.type,
                scope: payload.scope,
                keyId: payload.keyId,
                issuedAt: new Date(payload.iat * 1000),
                expiresAt: new Date(payload.exp * 1000),
                issuer: payload.iss,
                audience: payload.aud,
                jwtId: payload.jti,
                isExpired: payload.exp < Math.floor(Date.now() / 1000),
                expiresIn: payload.exp - Math.floor(Date.now() / 1000)
            };
        } catch (error) {
            console.error('❌ Get token info error:', error);
            throw new Error('Failed to get token information');
        }
    }

    // ===== TOKEN VALIDATION =====

    /**
     * Validate token claims
     * @param {Object} decoded - Decoded token payload
     */
    validateTokenClaims(decoded) {
        // Check required claims
        const requiredClaims = ['userId', 'iat', 'exp'];
        for (const claim of requiredClaims) {
            if (!decoded[claim] && !decoded.sub) {
                throw new Error(`Missing required claim: ${claim}`);
            }
        }

        // Check token not expired
        if (decoded.exp <= Math.floor(Date.now() / 1000)) {
            throw new Error('Token has expired');
        }

        // Check token not used before valid time
        if (decoded.nbf && decoded.nbf > Math.floor(Date.now() / 1000)) {
            throw new Error('Token not yet valid');
        }

        // Additional custom validations can be added here
    }

    /**
     * Check if token is expired
     * @param {string} token - JWT token
     * @returns {boolean} Is expired
     */
    isTokenExpired(token) {
        try {
            const info = this.getTokenInfo(token);
            return info.isExpired;
        } catch (error) {
            return true; // Consider invalid tokens as expired
        }
    }

    /**
     * Get token expiry time
     * @param {string} token - JWT token
     * @returns {Date|null} Expiry date
     */
    getTokenExpiry(token) {
        try {
            const info = this.getTokenInfo(token);
            return info.expiresAt;
        } catch (error) {
            return null;
        }
    }

    // ===== UTILITY METHODS =====

    /**
     * Generate unique JWT ID
     * @returns {string} Unique JTI
     */
    generateJTI() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Get default scope based on user roles
     * @param {Array} roles - User roles
     * @returns {Array} Scope array
     */
    getDefaultScope(roles = []) {
        const scopeMap = {
            'USER': ['read', 'write'],
            'SELLER': ['read', 'write', 'sell'],
            'ADMIN': ['read', 'write', 'admin'],
            'MANAGER': ['read', 'write', 'manage']
        };

        const scopes = new Set(['read']); // Default scope

        roles.forEach(role => {
            if (scopeMap[role]) {
                scopeMap[role].forEach(scope => scopes.add(scope));
            }
        });

        return Array.from(scopes);
    }

    /**
     * Parse expiry string to seconds
     * @param {string} expiry - Expiry string (1h, 30d, etc.)
     * @returns {number} Seconds
     */
    parseExpiry(expiry) {
        const units = {
            's': 1,
            'm': 60,
            'h': 3600,
            'd': 86400,
            'w': 604800,
            'y': 31536000
        };

        const match = expiry.match(/^(\d+)([smhdwy])$/);
        if (!match) {
            throw new Error('Invalid expiry format');
        }

        const [, value, unit] = match;
        return parseInt(value) * units[unit];
    }

    /**
     * Handle verification errors
     * @param {Error} error - JWT verification error
     * @returns {Error} Processed error
     */
    handleVerificationError(error) {
        if (error.name === 'TokenExpiredError') {
            return new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            return new Error('Invalid token');
        }
        if (error.name === 'NotBeforeError') {
            return new Error('Token not active yet');
        }
        return error;
    }

    /**
     * Extract token from Authorization header
     * @param {string} authHeader - Authorization header value
     * @returns {string|null} Extracted token
     */
    extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    /**
     * Create token blacklist key
     * @param {string} token - JWT token
     * @returns {string} Blacklist key
     */
    createBlacklistKey(token) {
        const decoded = this.decodeToken(token);
        return `blacklist:${decoded.payload.jti || this.generateJTI()}`;
    }

    // ===== KEY MANAGEMENT =====

    /**
     * Cache key pair
     * @param {string} keyId - Key identifier
     * @param {Object} keyPair - Key pair object
     */
    cacheKeyPair(keyId, keyPair) {
        this.keyCache.set(keyId, {
            ...keyPair,
            cachedAt: Date.now()
        });

        // Cleanup old cache entries (keep last 100)
        if (this.keyCache.size > 100) {
            const entries = Array.from(this.keyCache.entries());
            entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);

            // Remove oldest 20 entries
            for (let i = 0; i < 20; i++) {
                this.keyCache.delete(entries[i][0]);
            }
        }
    }

    /**
     * Get cached key pair
     * @param {string} keyId - Key identifier
     * @returns {Object|null} Cached key pair
     */
    getCachedKeyPair(keyId) {
        return this.keyCache.get(keyId) || null;
    }

    /**
     * Clear key cache
     */
    clearKeyCache() {
        this.keyCache.clear();
        console.log('🧹 JWT key cache cleared');
    }

    // ===== TOKEN REFRESH =====

    /**
     * Refresh token pair
     * @param {string} refreshToken - Current refresh token
     * @param {string} publicKey - Public key for verification
     * @param {string} privateKey - Private key for signing
     * @param {Object} user - User object
     * @returns {Object} New token pair
     */
    refreshTokenPair(refreshToken, publicKey, privateKey, user) {
        try {
            // Verify refresh token
            const decoded = this.verifyRefreshToken(refreshToken, publicKey);

            // Generate new token pair
            const newTokens = this.generateTokenPair(user, privateKey, decoded.keyId);

            console.log(`🔄 Token pair refreshed for user: ${user._id}`);
            return newTokens;
        } catch (error) {
            console.error('❌ Token refresh error:', error);
            throw new Error('Failed to refresh token pair');
        }
    }
}

// Export singleton instance
module.exports = new JWTHelper();