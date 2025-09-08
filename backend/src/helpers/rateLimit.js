"use strict";

require('dotenv').config();
const { getRedisHelper } = require('./redisHelper'); // Import Redis Helper

/**
 * Complete Rate Limiting Helper
 * Sử dụng Redis Helper để thực hiện rate limiting với sliding window algorithm
 * Hỗ trợ whitelist, blacklist, blocking, và nhiều tính năng nâng cao
 */
class RateLimitHelper {
    constructor(options = {}) {
        // Config từ environment hoặc options
        this.windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 phút
        this.maxRequests = options.maxRequests || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
        this.keyPrefix = options.keyPrefix || process.env.RATE_LIMIT_KEY_PREFIX || 'rate_limit:';
        this.blockDuration = options.blockDuration || parseInt(process.env.RATE_LIMIT_BLOCK_DURATION) || 0; // 0 = không block
        this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
        this.skipFailedRequests = options.skipFailedRequests || false;

        // Sử dụng Redis Helper
        this.redis = getRedisHelper(options.redis || {});

        console.log(`🛡️  Rate Limiting Helper initialized:`);
        console.log(`   - Window: ${this.windowMs / 1000}s (${this.windowMs / 60000} minutes)`);
        console.log(`   - Max requests: ${this.maxRequests}`);
        console.log(`   - Key prefix: ${this.keyPrefix}`);
        console.log(`   - Block duration: ${this.blockDuration}s`);
    }

    /**
     * Đảm bảo Redis đã kết nối
     */
    async ensureRedisConnected() {
        if (!this.redis.isConnected) {
            await this.redis.connect();
        }
    }

    /**
     * Generate các loại keys
     */
    getKey(identifier, type = 'rate') {
        const keyMap = {
            rate: `${this.keyPrefix}${identifier}`,
            block: `${this.keyPrefix}block:${identifier}`,
            whitelist: `${this.keyPrefix}whitelist:${identifier}`,
            blacklist: `${this.keyPrefix}blacklist:${identifier}`,
            stats: `${this.keyPrefix}stats:${identifier}`
        };
        return keyMap[type] || keyMap.rate;
    }

    /**
     * Kiểm tra rate limit cho identifier (IP, User ID, API Key, etc.)
     * Sử dụng Sliding Window với Redis Sorted Sets
     */
    async checkRateLimit(identifier, options = {}) {
        await this.ensureRedisConnected();

        const key = this.getKey(identifier, 'rate');
        const blockKey = this.getKey(identifier, 'block');
        const statsKey = this.getKey(identifier, 'stats');
        const now = Date.now();
        const windowStart = now - this.windowMs;

        try {
            // 1. Kiểm tra blacklist
            const isBlacklisted = await this.isBlacklisted(identifier);
            if (isBlacklisted) {
                await this.updateStats(identifier, 'blocked_blacklist');
                return {
                    allowed: false,
                    limit: this.maxRequests,
                    remaining: 0,
                    resetTime: now + this.windowMs,
                    retryAfter: Math.ceil(this.windowMs / 1000),
                    totalRequests: this.maxRequests,
                    windowMs: this.windowMs,
                    blocked: true,
                    reason: 'blacklisted'
                };
            }

            // 2. Kiểm tra whitelist
            const isWhitelisted = await this.isWhitelisted(identifier);
            if (isWhitelisted) {
                await this.updateStats(identifier, 'allowed_whitelist');
                return {
                    allowed: true,
                    limit: this.maxRequests,
                    remaining: this.maxRequests,
                    resetTime: now + this.windowMs,
                    retryAfter: 0,
                    totalRequests: 0,
                    windowMs: this.windowMs,
                    whitelisted: true
                };
            }

            // 3. Kiểm tra block
            if (this.blockDuration > 0) {
                const isBlocked = await this.redis.exists(blockKey);
                if (isBlocked) {
                    const blockTtl = await this.redis.ttl(blockKey);
                    await this.updateStats(identifier, 'blocked_rate_limit');
                    return {
                        allowed: false,
                        limit: this.maxRequests,
                        remaining: 0,
                        resetTime: now + (blockTtl * 1000),
                        retryAfter: blockTtl,
                        totalRequests: this.maxRequests,
                        windowMs: this.windowMs,
                        blocked: true,
                        blockTimeRemaining: blockTtl,
                        reason: 'rate_limit_block'
                    };
                }
            }

            // 4. Sliding window rate limiting
            const multi = this.redis.multi();

            // Xóa các requests cũ hơn window
            multi.zRemRangeByScore(key, 0, windowStart);

            // Đếm số requests hiện tại trong window
            multi.zCard(key);

            // Thực hiện operations
            const results = await multi.exec();
            const currentCount = results[1] || 0;

            // Kiểm tra có vượt quá limit không
            const allowed = currentCount < this.maxRequests;

            if (allowed) {
                // Thêm request hiện tại
                const requestId = `${now}-${Math.random().toString(36).substr(2, 9)}`;
                await this.redis.zAdd(key, now, requestId);

                // Set TTL cho key
                await this.redis.expire(key, Math.ceil(this.windowMs / 1000));

                // Update stats
                await this.updateStats(identifier, 'allowed');
            } else {
                // Rate limit exceeded
                await this.updateStats(identifier, 'rejected');

                // Nếu có block duration, tạo block
                if (this.blockDuration > 0) {
                    await this.redis.set(blockKey, JSON.stringify({
                        blockedAt: now,
                        reason: 'rate_limit_exceeded',
                        requests: currentCount
                    }), { ttl: this.blockDuration });

                    await this.updateStats(identifier, 'blocked_created');
                }
            }

            // Tính toán thông tin trả về
            const finalCount = allowed ? currentCount + 1 : currentCount;
            const remaining = Math.max(0, this.maxRequests - finalCount);
            const resetTime = await this.getResetTime(key, now);

            const result = {
                allowed,
                limit: this.maxRequests,
                remaining,
                resetTime,
                retryAfter: resetTime ? Math.ceil((resetTime - now) / 1000) : 0,
                totalRequests: finalCount,
                windowMs: this.windowMs,
                blocked: false,
                identifier
            };

            // Thêm metadata nếu có options
            if (options.includeMetadata) {
                result.metadata = {
                    requestId: allowed ? `${now}-${Math.random().toString(36).substr(2, 9)}` : null,
                    timestamp: new Date(now).toISOString(),
                    windowStart: new Date(windowStart).toISOString(),
                    windowEnd: new Date(windowStart + this.windowMs).toISOString()
                };
            }

            return result;

        } catch (error) {
            console.error('❌ Rate limit check error:', error);
            await this.updateStats(identifier, 'error');

            // Fallback: allow request nếu Redis lỗi (fail open)
            return {
                allowed: true,
                limit: this.maxRequests,
                remaining: this.maxRequests - 1,
                resetTime: now + this.windowMs,
                retryAfter: 0,
                totalRequests: 1,
                windowMs: this.windowMs,
                error: error.message,
                fallback: true
            };
        }
    }

    /**
     * Tính toán reset time dựa trên oldest request
     */
    async getResetTime(key, currentTime) {
        try {
            const oldest = await this.redis.zRange(key, 0, 0, true); // withScores = true
            if (oldest.length > 0 && oldest[0].score) {
                return parseInt(oldest[0].score) + this.windowMs;
            }
            return currentTime + this.windowMs;
        } catch (error) {
            return currentTime + this.windowMs;
        }
    }

    /**
     * Update statistics
     */
    async updateStats(identifier, action) {
        try {
            const statsKey = this.getKey(identifier, 'stats');
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            await this.redis.hSet(statsKey, `${action}:${today}`,
                await this.redis.hGet(statsKey, `${action}:${today}`) || '0');
            await this.redis.incr(`${statsKey}:${action}:${today}`);
            await this.redis.expire(`${statsKey}:${action}:${today}`, 86400 * 7); // 7 days

            // Total counters
            await this.redis.incr(`${statsKey}:total:${action}`);
            await this.redis.expire(`${statsKey}:total:${action}`, 86400 * 30); // 30 days
        } catch (error) {
            console.error('❌ Stats update error:', error);
        }
    }

    /**
     * Express.js middleware với nhiều options
     */
    middleware(options = {}) {
        const {
            skipIf = () => false,
            keyGenerator = (req) => req.ip || req.connection.remoteAddress || 'unknown',
            onLimitReached = null,
            onError = null,
            excludePaths = [],
            includePaths = [],
            message = 'Too many requests',
            headers = true,
            standardHeaders = true,
            draft7Headers = false,
            trustProxy = false,
            legacyHeaders = false
        } = options;

        return async (req, res, next) => {
            try {
                // Skip conditions
                if (skipIf(req)) {
                    return next();
                }

                // Path filtering
                if (excludePaths.length > 0) {
                    const shouldExclude = excludePaths.some(path =>
                        typeof path === 'string' ? req.path.startsWith(path) :
                            path instanceof RegExp ? path.test(req.path) :
                                false
                    );
                    if (shouldExclude) return next();
                }

                if (includePaths.length > 0) {
                    const shouldInclude = includePaths.some(path =>
                        typeof path === 'string' ? req.path.startsWith(path) :
                            path instanceof RegExp ? path.test(req.path) :
                                false
                    );
                    if (!shouldInclude) return next();
                }

                // Generate identifier
                let identifier;
                try {
                    identifier = keyGenerator(req);
                } catch (error) {
                    console.error('❌ Key generator error:', error);
                    identifier = req.ip || 'unknown';
                }

                // Check rate limit
                const result = await this.checkRateLimit(identifier, {
                    includeMetadata: true
                });

                // Set headers
                if (headers) {
                    const headersToSet = {};

                    // Standard headers
                    if (standardHeaders) {
                        headersToSet['X-RateLimit-Limit'] = result.limit.toString();
                        headersToSet['X-RateLimit-Remaining'] = result.remaining.toString();
                        headersToSet['X-RateLimit-Reset'] = new Date(result.resetTime).toISOString();
                        headersToSet['X-RateLimit-Window'] = `${this.windowMs / 1000}s`;
                    }

                    // RFC 6585 headers
                    if (standardHeaders && !result.allowed) {
                        headersToSet['Retry-After'] = result.retryAfter.toString();
                    }

                    // Draft 7 headers (new standard)
                    if (draft7Headers) {
                        headersToSet['RateLimit-Limit'] = result.limit.toString();
                        headersToSet['RateLimit-Remaining'] = result.remaining.toString();
                        headersToSet['RateLimit-Reset'] = Math.ceil(result.resetTime / 1000).toString();
                    }

                    // Legacy headers (compatibility)
                    if (legacyHeaders) {
                        headersToSet['X-Rate-Limit-Limit'] = result.limit.toString();
                        headersToSet['X-Rate-Limit-Remaining'] = result.remaining.toString();
                        headersToSet['X-Rate-Limit-Reset'] = Math.ceil(result.resetTime / 1000).toString();
                    }

                    // Additional info headers
                    if (result.blocked) {
                        headersToSet['X-RateLimit-Blocked'] = 'true';
                        if (result.blockTimeRemaining) {
                            headersToSet['X-RateLimit-Block-Duration'] = result.blockTimeRemaining.toString();
                        }
                    }

                    if (result.whitelisted) {
                        headersToSet['X-RateLimit-Whitelisted'] = 'true';
                    }

                    if (result.fallback) {
                        headersToSet['X-RateLimit-Fallback'] = 'true';
                    }

                    res.set(headersToSet);
                }

                if (!result.allowed) {
                    // Determine status code
                    let statusCode = 429;
                    if (result.reason === 'blacklisted') statusCode = 403;

                    // Logging
                    const logLevel = result.reason === 'blacklisted' ? 'error' : 'warn';
                    const logMessage = result.blocked ?
                        `🚫 Rate limit BLOCKED: ${identifier} (${result.reason})` :
                        `🚨 Rate limit exceeded: ${identifier} (${result.totalRequests}/${result.limit})`;

                    console[logLevel](logMessage);
                    console[logLevel](`   - Reset: ${new Date(result.resetTime).toISOString()}`);
                    console[logLevel](`   - Retry after: ${result.retryAfter}s`);

                    // Custom callback
                    if (onLimitReached) {
                        try {
                            await onLimitReached(req, res, result);
                        } catch (callbackError) {
                            console.error('❌ onLimitReached callback error:', callbackError);
                        }
                    }

                    // Error response
                    const errorResponse = {
                        error: result.reason === 'blacklisted' ? 'Access Forbidden' :
                            result.blocked ? 'Rate Limit Blocked' : 'Too Many Requests',
                        message: result.reason === 'blacklisted' ?
                            'Your access has been restricted.' :
                            result.blocked ?
                                `Too many requests. You are temporarily blocked for ${result.blockTimeRemaining} seconds.` :
                                `${message}. Try again in ${result.retryAfter} seconds.`,
                        retryAfter: result.retryAfter,
                        limit: result.limit,
                        remaining: 0,
                        resetTime: new Date(result.resetTime).toISOString(),
                        code: result.reason === 'blacklisted' ? 'BLACKLISTED' :
                            result.blocked ? 'RATE_LIMIT_BLOCKED' : 'RATE_LIMIT_EXCEEDED'
                    };

                    if (result.blocked && result.blockTimeRemaining) {
                        errorResponse.blocked = true;
                        errorResponse.blockDuration = result.blockTimeRemaining;
                    }

                    return res.status(statusCode).json(errorResponse);
                }

                // Success logging (dev only)
                if (process.env.NODE_ENV === 'dev' && !result.whitelisted) {
                    console.log(`📊 ${identifier}: ${result.totalRequests}/${result.limit} (${result.remaining} remaining)`);
                }

                // Add rate limit info to request object
                req.rateLimit = result;

                next();
            } catch (error) {
                console.error('❌ Rate limiting middleware error:', error);

                // Custom error callback
                if (onError) {
                    try {
                        await onError(req, res, error);
                    } catch (callbackError) {
                        console.error('❌ onError callback error:', callbackError);
                    }
                }

                // Fallback: allow request (fail open)
                next();
            }
        };
    }

    /**
     * Lấy thống kê chi tiết cho identifier
     */
    async getStats(identifier) {
        await this.ensureRedisConnected();

        const key = this.getKey(identifier, 'rate');
        const blockKey = this.getKey(identifier, 'block');
        const statsKey = this.getKey(identifier, 'stats');
        const now = Date.now();
        const windowStart = now - this.windowMs;

        try {
            // Cleanup old entries
            await this.redis.zRemRangeByScore(key, 0, windowStart);

            // Get current requests with scores
            const requests = await this.redis.zRange(key, 0, -1, true); // withScores = true
            const totalRequests = requests.length;
            const remaining = Math.max(0, this.maxRequests - totalRequests);

            // Reset time calculation
            const resetTime = requests.length > 0 ?
                parseInt(requests[0].score) + this.windowMs :
                now + this.windowMs;

            // Check statuses
            const isBlocked = await this.redis.exists(blockKey);
            const blockTtl = isBlocked ? await this.redis.ttl(blockKey) : 0;
            const isWhitelisted = await this.isWhitelisted(identifier);
            const isBlacklisted = await this.isBlacklisted(identifier);

            // Get daily stats
            const today = new Date().toISOString().split('T')[0];
            const dailyStats = {
                allowed: parseInt(await this.redis.get(`${statsKey}:allowed:${today}`) || '0'),
                rejected: parseInt(await this.redis.get(`${statsKey}:rejected:${today}`) || '0'),
                blocked: parseInt(await this.redis.get(`${statsKey}:blocked_created:${today}`) || '0'),
                errors: parseInt(await this.redis.get(`${statsKey}:error:${today}`) || '0')
            };

            // Get total stats
            const totalStats = {
                allowed: parseInt(await this.redis.get(`${statsKey}:total:allowed`) || '0'),
                rejected: parseInt(await this.redis.get(`${statsKey}:total:rejected`) || '0'),
                blocked: parseInt(await this.redis.get(`${statsKey}:total:blocked_created`) || '0'),
                errors: parseInt(await this.redis.get(`${statsKey}:total:error`) || '0')
            };

            return {
                identifier,
                currentWindow: {
                    totalRequests,
                    remaining,
                    limit: this.maxRequests,
                    resetTime: new Date(resetTime).toISOString(),
                    windowMs: this.windowMs
                },
                status: {
                    blocked: isBlocked,
                    blockTimeRemaining: blockTtl,
                    whitelisted: isWhitelisted,
                    blacklisted: isBlacklisted
                },
                statistics: {
                    today: dailyStats,
                    total: totalStats
                },
                recentRequests: requests.slice(-10).map(r => ({
                    timestamp: new Date(parseInt(r.score)).toISOString(),
                    requestId: r.value,
                    score: r.score
                })),
                config: {
                    windowMs: this.windowMs,
                    maxRequests: this.maxRequests,
                    blockDuration: this.blockDuration
                }
            };
        } catch (error) {
            console.error('❌ Error getting rate limit stats:', error);
            return {
                identifier,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Lấy tổng quan thống kê hệ thống
     */
    async getOverallStats() {
        await this.ensureRedisConnected();

        try {
            const patterns = {
                rate: `${this.keyPrefix}*`,
                block: `${this.keyPrefix}block:*`,
                whitelist: `${this.keyPrefix}whitelist:*`,
                blacklist: `${this.keyPrefix}blacklist:*`
            };

            // Get all keys by type
            const allKeys = await this.redis.keys(patterns.rate);
            const rateLimitKeys = allKeys.filter(key =>
                !key.includes(':block:') &&
                !key.includes(':whitelist:') &&
                !key.includes(':blacklist:') &&
                !key.includes(':stats:')
            );

            const blockKeys = await this.redis.keys(patterns.block);
            const whitelistKeys = await this.redis.keys(patterns.whitelist);
            const blacklistKeys = await this.redis.keys(patterns.blacklist);

            let totalActiveIdentifiers = rateLimitKeys.length;
            let totalRequests = 0;
            let exceededIdentifiers = 0;

            // Sample để tránh overload (max 100 keys)
            const sampleKeys = rateLimitKeys.slice(0, 100);

            for (const key of sampleKeys) {
                try {
                    const count = await this.redis.zCard(key);
                    totalRequests += count;
                    if (count >= this.maxRequests) {
                        exceededIdentifiers++;
                    }
                } catch (error) {
                    console.error(`Error processing key ${key}:`, error);
                }
            }

            // Extrapolate if sampling
            const scaleFactor = rateLimitKeys.length / (sampleKeys.length || 1);
            if (scaleFactor > 1) {
                totalRequests = Math.round(totalRequests * scaleFactor);
                exceededIdentifiers = Math.round(exceededIdentifiers * scaleFactor);
            }

            // Redis info
            const redisInfo = await this.redis.info('memory');
            const memoryUsage = redisInfo.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'N/A';

            return {
                summary: {
                    totalActiveIdentifiers,
                    sampledIdentifiers: sampleKeys.length,
                    totalRequests,
                    exceededIdentifiers,
                    blockedIdentifiers: blockKeys.length,
                    whitelistedIdentifiers: whitelistKeys.length,
                    blacklistedIdentifiers: blacklistKeys.length
                },
                config: {
                    windowMs: this.windowMs,
                    maxRequests: this.maxRequests,
                    blockDuration: this.blockDuration
                },
                redis: {
                    connected: this.redis.isConnected,
                    memoryUsage,
                    totalKeys: allKeys.length
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting overall stats:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Reset rate limit cho identifier
     */
    async resetIdentifier(identifier) {
        await this.ensureRedisConnected();

        try {
            const keys = {
                rate: this.getKey(identifier, 'rate'),
                block: this.getKey(identifier, 'block'),
                stats: this.getKey(identifier, 'stats')
            };

            const results = {};
            for (const [type, key] of Object.entries(keys)) {
                if (type === 'stats') {
                    // For stats, get all related keys
                    const statsKeys = await this.redis.keys(`${key}*`);
                    let deletedCount = 0;
                    for (const statsKey of statsKeys) {
                        deletedCount += await this.redis.del(statsKey);
                    }
                    results[type] = deletedCount;
                } else {
                    results[type] = await this.redis.del(key);
                }
            }

            console.log(`🔄 Rate limit reset for ${identifier}:`);
            console.log(`   - Rate limit data: ${results.rate > 0 ? 'deleted' : 'not found'}`);
            console.log(`   - Block data: ${results.block > 0 ? 'deleted' : 'not found'}`);
            console.log(`   - Stats data: ${results.stats > 0 ? `${results.stats} keys deleted` : 'not found'}`);

            return {
                identifier,
                deleted: results,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error resetting rate limit for ${identifier}:`, error);
            throw error;
        }
    }

    /**
     * Reset tất cả rate limits
     */
    async resetAll() {
        await this.ensureRedisConnected();

        try {
            const pattern = `${this.keyPrefix}*`;
            const keys = await this.redis.keys(pattern);

            if (keys.length === 0) {
                console.log('🔄 No rate limit data to reset');
                return { deletedCount: 0, totalKeys: 0 };
            }

            // Delete all keys in batches
            const batchSize = 100;
            let deletedCount = 0;

            for (let i = 0; i < keys.length; i += batchSize) {
                const batch = keys.slice(i, i + batchSize);
                const multi = this.redis.multi();

                for (const key of batch) {
                    multi.del(key);
                }

                const results = await multi.exec();
                deletedCount += results.reduce((sum, result) => sum + (result || 0), 0);
            }

            console.log(`🔄 Reset all rate limits: ${deletedCount} keys deleted out of ${keys.length}`);

            return {
                deletedCount,
                totalKeys: keys.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error resetting all rate limits:', error);
            throw error;
        }
    }

    // ===== WHITELIST MANAGEMENT =====

    /**
     * Thêm identifier vào whitelist
     */
    async addToWhitelist(identifier, duration = 0, reason = '') {
        await this.ensureRedisConnected();

        try {
            const whitelistKey = this.getKey(identifier, 'whitelist');
            const data = {
                addedAt: Date.now(),
                reason: reason || 'Manual whitelist',
                duration: duration || 'permanent'
            };

            if (duration > 0) {
                await this.redis.set(whitelistKey, JSON.stringify(data), { ttl: duration });
            } else {
                await this.redis.set(whitelistKey, JSON.stringify(data));
            }

            // Remove existing rate limit and block data
            await this.resetIdentifier(identifier);

            console.log(`✅ Added ${identifier} to whitelist${duration > 0 ? ` for ${duration}s` : ' permanently'}`);
            if (reason) console.log(`   - Reason: ${reason}`);

            return {
                identifier,
                whitelisted: true,
                duration: duration || 'permanent',
                reason,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error adding ${identifier} to whitelist:`, error);
            throw error;
        }
    }

    /**
     * Remove khỏi whitelist
     */
    async removeFromWhitelist(identifier) {
        await this.ensureRedisConnected();

        try {
            const whitelistKey = this.getKey(identifier, 'whitelist');
            const deleted = await this.redis.del(whitelistKey);

            console.log(`${deleted > 0 ? '✅' : '⚠️'} ${deleted > 0 ? 'Removed' : 'Not found'} ${identifier} from whitelist`);

            return {
                identifier,
                removed: deleted > 0,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error removing ${identifier} from whitelist:`, error);
            throw error;
        }
    }

    /**
     * Kiểm tra whitelist
     */
    async isWhitelisted(identifier) {
        try {
            await this.ensureRedisConnected();
            const whitelistKey = this.getKey(identifier, 'whitelist');
            return await this.redis.exists(whitelistKey);
        } catch (error) {
            console.error(`❌ Error checking whitelist for ${identifier}:`, error);
            return false;
        }
    }

    /**
     * Get whitelist
     */
    async getWhitelist() {
        await this.ensureRedisConnected();

        try {
            const pattern = `${this.keyPrefix}whitelist:*`;
            const keys = await this.redis.keys(pattern);

            const whitelist = [];
            for (const key of keys) {
                const identifier = key.replace(`${this.keyPrefix}whitelist:`, '');
                const data = await this.redis.get(key, true); // parseJson
                const ttl = await this.redis.ttl(key);

                whitelist.push({
                    identifier,
                    data: data || {},
                    permanent: ttl === -1,
                    expiresIn: ttl > 0 ? ttl : null,
                    expiresAt: ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null
                });
            }

            return {
                whitelist,
                count: whitelist.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting whitelist:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ===== BLACKLIST MANAGEMENT =====

    /**
     * Thêm identifier vào blacklist
     */
    async addToBlacklist(identifier, duration = 0, reason = '') {
        await this.ensureRedisConnected();

        try {
            const blacklistKey = this.getKey(identifier, 'blacklist');
            const data = {
                addedAt: Date.now(),
                reason: reason || 'Manual blacklist',
                duration: duration || 'permanent'
            };

            if (duration > 0) {
                await this.redis.set(blacklistKey, JSON.stringify(data), { ttl: duration });
            } else {
                await this.redis.set(blacklistKey, JSON.stringify(data));
            }

            // Remove from whitelist if exists
            await this.removeFromWhitelist(identifier);

            console.log(`🚫 Added ${identifier} to blacklist${duration > 0 ? ` for ${duration}s` : ' permanently'}`);
            if (reason) console.log(`   - Reason: ${reason}`);

            return {
                identifier,
                blacklisted: true,
                duration: duration || 'permanent',
                reason,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error adding ${identifier} to blacklist:`, error);
            throw error;
        }
    }

    /**
     * Remove khỏi blacklist
     */
    async removeFromBlacklist(identifier) {
        await this.ensureRedisConnected();

        try {
            const blacklistKey = this.getKey(identifier, 'blacklist');
            const deleted = await this.redis.del(blacklistKey);

            console.log(`${deleted > 0 ? '✅' : '⚠️'} ${deleted > 0 ? 'Removed' : 'Not found'} ${identifier} from blacklist`);

            return {
                identifier,
                removed: deleted > 0,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error removing ${identifier} from blacklist:`, error);
            throw error;
        }
    }

    /**
     * Kiểm tra blacklist
     */
    async isBlacklisted(identifier) {
        try {
            await this.ensureRedisConnected();
            const blacklistKey = this.getKey(identifier, 'blacklist');
            return await this.redis.exists(blacklistKey);
        } catch (error) {
            console.error(`❌ Error checking blacklist for ${identifier}:`, error);
            return false;
        }
    }

    /**
     * Get blacklist
     */
    async getBlacklist() {
        await this.ensureRedisConnected();

        try {
            const pattern = `${this.keyPrefix}blacklist:*`;
            const keys = await this.redis.keys(pattern);

            const blacklist = [];
            for (const key of keys) {
                const identifier = key.replace(`${this.keyPrefix}blacklist:`, '');
                const data = await this.redis.get(key, true); // parseJson
                const ttl = await this.redis.ttl(key);

                blacklist.push({
                    identifier,
                    data: data || {},
                    permanent: ttl === -1,
                    expiresIn: ttl > 0 ? ttl : null,
                    expiresAt: ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null
                });
            }

            return {
                blacklist,
                count: blacklist.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting blacklist:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ===== ADVANCED FEATURES =====

    /**
     * Batch operations
     */
    async batchOperation(operation, identifiers, ...args) {
        await this.ensureRedisConnected();

        const results = [];
        const batchSize = 50;

        try {
            for (let i = 0; i < identifiers.length; i += batchSize) {
                const batch = identifiers.slice(i, i + batchSize);
                const batchPromises = batch.map(identifier => {
                    switch (operation) {
                        case 'reset':
                            return this.resetIdentifier(identifier);
                        case 'whitelist':
                            return this.addToWhitelist(identifier, ...args);
                        case 'blacklist':
                            return this.addToBlacklist(identifier, ...args);
                        case 'stats':
                            return this.getStats(identifier);
                        default:
                            throw new Error(`Unknown operation: ${operation}`);
                    }
                });

                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults);
            }

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`📊 Batch ${operation}: ${successful} successful, ${failed} failed`);

            return {
                operation,
                total: identifiers.length,
                successful,
                failed,
                results: results.map((r, i) => ({
                    identifier: identifiers[i],
                    status: r.status,
                    result: r.status === 'fulfilled' ? r.value : null,
                    error: r.status === 'rejected' ? r.reason?.message : null
                })),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Batch operation ${operation} error:`, error);
            throw error;
        }
    }

    /**
     * Auto cleanup expired entries
     */
    async cleanup(options = {}) {
        await this.ensureRedisConnected();

        const { dryRun = false, batchSize = 100 } = options;

        try {
            const patterns = [
                `${this.keyPrefix}*`,
                `${this.keyPrefix}stats:*`
            ];

            let totalCleaned = 0;
            let totalChecked = 0;

            for (const pattern of patterns) {
                const keys = await this.redis.keys(pattern);
                totalChecked += keys.length;

                for (let i = 0; i < keys.length; i += batchSize) {
                    const batch = keys.slice(i, i + batchSize);

                    for (const key of batch) {
                        try {
                            const ttl = await this.redis.ttl(key);

                            // Clean expired keys (TTL = -2) or very old stats
                            if (ttl === -2) {
                                if (!dryRun) {
                                    await this.redis.del(key);
                                }
                                totalCleaned++;
                            } else if (key.includes(':stats:') && ttl === -1) {
                                // Check if stats key is older than 30 days
                                const exists = await this.redis.exists(key);
                                if (!exists) {
                                    if (!dryRun) {
                                        await this.redis.del(key);
                                    }
                                    totalCleaned++;
                                }
                            }
                        } catch (keyError) {
                            console.error(`Error processing key ${key}:`, keyError);
                        }
                    }
                }
            }

            console.log(`🧹 Cleanup ${dryRun ? '(dry run)' : 'completed'}: ${totalCleaned} keys cleaned out of ${totalChecked} checked`);

            return {
                cleaned: totalCleaned,
                checked: totalChecked,
                dryRun,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Cleanup error:', error);
            throw error;
        }
    }

    /**
     * Export configuration và data
     */
    async exportData(options = {}) {
        await this.ensureRedisConnected();

        const { includeStats = false, format = 'json' } = options;

        try {
            const data = {
                config: {
                    windowMs: this.windowMs,
                    maxRequests: this.maxRequests,
                    keyPrefix: this.keyPrefix,
                    blockDuration: this.blockDuration
                },
                whitelist: await this.getWhitelist(),
                blacklist: await this.getBlacklist(),
                exportedAt: new Date().toISOString()
            };

            if (includeStats) {
                const overallStats = await this.getOverallStats();
                data.overallStats = overallStats;
            }

            if (format === 'json') {
                return JSON.stringify(data, null, 2);
            } else if (format === 'object') {
                return data;
            } else {
                throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('❌ Export error:', error);
            throw error;
        }
    }

    /**
     * Import configuration và data
     */
    async importData(data, options = {}) {
        await this.ensureRedisConnected();

        const { overwrite = false, dryRun = false } = options;

        try {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            const results = {
                whitelist: { imported: 0, skipped: 0, errors: 0 },
                blacklist: { imported: 0, skipped: 0, errors: 0 }
            };

            // Import whitelist
            if (parsedData.whitelist?.whitelist) {
                for (const item of parsedData.whitelist.whitelist) {
                    try {
                        const exists = await this.isWhitelisted(item.identifier);
                        if (exists && !overwrite) {
                            results.whitelist.skipped++;
                            continue;
                        }

                        if (!dryRun) {
                            const duration = item.permanent ? 0 : item.expiresIn || 0;
                            const reason = item.data?.reason || 'Imported';
                            await this.addToWhitelist(item.identifier, duration, reason);
                        }
                        results.whitelist.imported++;
                    } catch (error) {
                        results.whitelist.errors++;
                        console.error(`Error importing whitelist ${item.identifier}:`, error);
                    }
                }
            }

            // Import blacklist
            if (parsedData.blacklist?.blacklist) {
                for (const item of parsedData.blacklist.blacklist) {
                    try {
                        const exists = await this.isBlacklisted(item.identifier);
                        if (exists && !overwrite) {
                            results.blacklist.skipped++;
                            continue;
                        }

                        if (!dryRun) {
                            const duration = item.permanent ? 0 : item.expiresIn || 0;
                            const reason = item.data?.reason || 'Imported';
                            await this.addToBlacklist(item.identifier, duration, reason);
                        }
                        results.blacklist.imported++;
                    } catch (error) {
                        results.blacklist.errors++;
                        console.error(`Error importing blacklist ${item.identifier}:`, error);
                    }
                }
            }

            console.log(`📥 Import ${dryRun ? '(dry run)' : 'completed'}:`);
            console.log(`   - Whitelist: ${results.whitelist.imported} imported, ${results.whitelist.skipped} skipped, ${results.whitelist.errors} errors`);
            console.log(`   - Blacklist: ${results.blacklist.imported} imported, ${results.blacklist.skipped} skipped, ${results.blacklist.errors} errors`);

            return {
                results,
                dryRun,
                overwrite,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Import error:', error);
            throw error;
        }
    }

    /**
     * Health check với chi tiết
     */
    async healthCheck() {
        try {
            await this.ensureRedisConnected();
            const start = Date.now();
            const pingResult = await this.redis.ping();
            const pingTime = Date.now() - start;

            // Test basic operations
            const testKey = `${this.keyPrefix}health_test`;
            await this.redis.set(testKey, 'test', { ttl: 10 });
            const testValue = await this.redis.get(testKey);
            await this.redis.del(testKey);

            const basicOperationsWorking = testValue === 'test';

            // Get memory info
            const redisInfo = await this.redis.info('memory');
            const memoryUsage = redisInfo.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'N/A';

            // Check key counts
            const totalKeys = (await this.redis.keys(`${this.keyPrefix}*`)).length;

            return {
                status: basicOperationsWorking ? 'healthy' : 'degraded',
                redis: {
                    connected: this.redis.isConnected,
                    ping: pingResult,
                    pingTime: `${pingTime}ms`,
                    memoryUsage,
                    basicOperations: basicOperationsWorking
                },
                rateLimiter: {
                    totalKeys,
                    keyPrefix: this.keyPrefix
                },
                config: {
                    windowMs: this.windowMs,
                    maxRequests: this.maxRequests,
                    blockDuration: this.blockDuration
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Middleware với whitelist và blacklist
     */
    middlewareWithLists(options = {}) {
        const originalMiddleware = this.middleware(options);

        return async (req, res, next) => {
            try {
                const identifier = (options.keyGenerator || ((req) => req.ip || req.connection.remoteAddress || 'unknown'))(req);

                // Check blacklist first
                const isBlacklisted = await this.isBlacklisted(identifier);
                if (isBlacklisted) {
                    if (process.env.NODE_ENV === 'dev') {
                        console.log(`🚫 ${identifier} is blacklisted`);
                    }
                    return res.status(403).json({
                        error: 'Access Forbidden',
                        message: 'Your access has been restricted.',
                        code: 'BLACKLISTED'
                    });
                }

                // Check whitelist
                const isWhitelisted = await this.isWhitelisted(identifier);
                if (isWhitelisted) {
                    if (process.env.NODE_ENV === 'dev') {
                        console.log(`✅ ${identifier} is whitelisted, skipping rate limit`);
                    }
                    return next();
                }

                // Apply normal rate limiting
                return originalMiddleware(req, res, next);
            } catch (error) {
                console.error('❌ List check error:', error);
                return originalMiddleware(req, res, next);
            }
        };
    }
}

// ===== FACTORY FUNCTIONS =====

/**
 * Create new rate limiter instance
 */
function createRateLimiter(options = {}) {
    return new RateLimitHelper(options);
}

/**
 * Get default rate limiter instance (singleton)
 */
let defaultRateLimiter = null;

function getRateLimiter(options = {}) {
    if (!defaultRateLimiter) {
        defaultRateLimiter = new RateLimitHelper(options);
    }
    return defaultRateLimiter;
}

/**
 * Create rate limiter với preset configurations
 */
const presets = {
    // API thông thường
    api: (options = {}) => createRateLimiter({
        windowMs: 60000,    // 1 minute
        maxRequests: 60,    // 60 requests/minute
        keyPrefix: 'api_limit:',
        ...options
    }),

    // Strict cho authentication
    strict: (options = {}) => createRateLimiter({
        windowMs: 300000,   // 5 minutes
        maxRequests: 5,     // 5 requests/5 minutes
        blockDuration: 900, // Block 15 minutes
        keyPrefix: 'strict_limit:',
        ...options
    }),

    // Permissive cho static assets
    permissive: (options = {}) => createRateLimiter({
        windowMs: 60000,    // 1 minute
        maxRequests: 1000,  // 1000 requests/minute
        keyPrefix: 'permissive_limit:',
        ...options
    }),

    // Heavy cho file uploads
    heavy: (options = {}) => createRateLimiter({
        windowMs: 3600000,  // 1 hour
        maxRequests: 10,    // 10 requests/hour
        blockDuration: 3600, // Block 1 hour
        keyPrefix: 'heavy_limit:',
        ...options
    })
};

module.exports = {
    RateLimitHelper,
    createRateLimiter,
    getRateLimiter,
    presets
};