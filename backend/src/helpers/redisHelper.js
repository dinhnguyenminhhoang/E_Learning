"use strict";

require("dotenv").config();
const Redis = require("redis");

class RedisHelper {
  constructor(options = {}) {
    this.isConnected = false;
    this.client = null;

    // Config từ environment hoặc options
    this.config = {
      socket: {
        host: options.host || process.env.REDIS_HOST || "localhost",
        port: options.port || process.env.REDIS_PORT || 6379,
      },
      password: options.password || process.env.REDIS_PASSWORD || undefined,
      database: options.database || process.env.REDIS_DB || 0,
      ...options,
    };

    console.log(`🔧 Redis Helper initialized with config:`);
    console.log(`   - Host: ${this.config.socket.host}`);
    console.log(`   - Port: ${this.config.socket.port}`);
    console.log(`   - Database: ${this.config.database}`);
  }

  /**
   * Kết nối tới Redis
   */
  async connect() {
    if (this.isConnected && this.client) {
      return this.client;
    }

    try {
      this.client = Redis.createClient(this.config);

      // Event handlers
      this.client.on("error", (err) => {
        console.error("❌ Redis Client Error:", err.message);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("🔄 Connecting to Redis...");
      });

      this.client.on("ready", () => {
        console.log("✅ Redis connection ready!");
        this.isConnected = true;
      });

      this.client.on("end", () => {
        console.log("🔌 Redis connection ended");
        this.isConnected = false;
      });

      this.client.on("reconnecting", () => {
        console.log("🔄 Reconnecting to Redis...");
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Lấy Redis client instance
   */
  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error("Redis not connected. Call connect() first.");
    }
    return this.client;
  }

  /**
   * Đóng kết nối Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log("🔌 Redis disconnected");
    }
  }

  /**
   * Kiểm tra kết nối Redis
   */
  async ping() {
    try {
      const client = this.getClient();
      const result = await client.ping();
      return result === "PONG";
    } catch (error) {
      console.error("❌ Redis ping failed:", error.message);
      return false;
    }
  }

  // ===== STRING OPERATIONS =====

  /**
   * Set string value
   */
  async set(key, value, options = {}) {
    try {
      const client = this.getClient();
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);

      if (options.ttl) {
        return await client.setEx(key, options.ttl, stringValue);
      }
      return await client.set(key, stringValue);
    } catch (error) {
      console.error(`❌ Redis SET error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get string value
   */
  async get(key, parseJson = false) {
    try {
      const client = this.getClient();
      const value = await client.get(key);

      if (value === null) return null;

      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      console.error(`❌ Redis GET error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Delete key
   */
  async del(key) {
    try {
      const client = this.getClient();
      return await client.del(key);
    } catch (error) {
      console.error(`❌ Redis DEL error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      const client = this.getClient();
      return (await client.exists(key)) === 1;
    } catch (error) {
      console.error(`❌ Redis EXISTS error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Set TTL for key
   */
  async expire(key, seconds) {
    try {
      const client = this.getClient();
      return await client.expire(key, seconds);
    } catch (error) {
      console.error(`❌ Redis EXPIRE error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key) {
    try {
      const client = this.getClient();
      return await client.ttl(key);
    } catch (error) {
      console.error(`❌ Redis TTL error for key ${key}:`, error.message);
      throw error;
    }
  }

  // ===== HASH OPERATIONS =====

  /**
   * Set hash field
   */
  async hSet(key, field, value) {
    try {
      const client = this.getClient();
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      return await client.hSet(key, field, stringValue);
    } catch (error) {
      console.error(`❌ Redis HSET error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get hash field
   */
  async hGet(key, field, parseJson = false) {
    try {
      const client = this.getClient();
      const value = await client.hGet(key, field);

      if (value === null) return null;

      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      console.error(`❌ Redis HGET error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all hash fields
   */
  async hGetAll(key, parseJson = false) {
    try {
      const client = this.getClient();
      const hash = await client.hGetAll(key);

      if (parseJson) {
        const parsed = {};
        for (const [field, value] of Object.entries(hash)) {
          try {
            parsed[field] = JSON.parse(value);
          } catch {
            parsed[field] = value;
          }
        }
        return parsed;
      }
      return hash;
    } catch (error) {
      console.error(`❌ Redis HGETALL error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Delete hash field
   */
  async hDel(key, field) {
    try {
      const client = this.getClient();
      return await client.hDel(key, field);
    } catch (error) {
      console.error(`❌ Redis HDEL error for key ${key}:`, error.message);
      throw error;
    }
  }

  // ===== LIST OPERATIONS =====

  /**
   * Push to list (left)
   */
  async lPush(key, ...values) {
    try {
      const client = this.getClient();
      const stringValues = values.map((v) =>
        typeof v === "object" ? JSON.stringify(v) : String(v)
      );
      return await client.lPush(key, stringValues);
    } catch (error) {
      console.error(`❌ Redis LPUSH error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Push to list (right)
   */
  async rPush(key, ...values) {
    try {
      const client = this.getClient();
      const stringValues = values.map((v) =>
        typeof v === "object" ? JSON.stringify(v) : String(v)
      );
      return await client.rPush(key, stringValues);
    } catch (error) {
      console.error(`❌ Redis RPUSH error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Pop from list (left)
   */
  async lPop(key, parseJson = false) {
    try {
      const client = this.getClient();
      const value = await client.lPop(key);

      if (value === null) return null;

      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      console.error(`❌ Redis LPOP error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get list range
   */
  async lRange(key, start = 0, stop = -1, parseJson = false) {
    try {
      const client = this.getClient();
      const values = await client.lRange(key, start, stop);

      if (parseJson) {
        return values.map((v) => {
          try {
            return JSON.parse(v);
          } catch {
            return v;
          }
        });
      }
      return values;
    } catch (error) {
      console.error(`❌ Redis LRANGE error for key ${key}:`, error.message);
      throw error;
    }
  }

  // ===== SET OPERATIONS =====

  /**
   * Add to set
   */
  async sAdd(key, ...members) {
    try {
      const client = this.getClient();
      const stringMembers = members.map((m) =>
        typeof m === "object" ? JSON.stringify(m) : String(m)
      );
      return await client.sAdd(key, stringMembers);
    } catch (error) {
      console.error(`❌ Redis SADD error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all set members
   */
  async sMembers(key, parseJson = false) {
    try {
      const client = this.getClient();
      const members = await client.sMembers(key);

      if (parseJson) {
        return members.map((m) => {
          try {
            return JSON.parse(m);
          } catch {
            return m;
          }
        });
      }
      return members;
    } catch (error) {
      console.error(`❌ Redis SMEMBERS error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Remove from set
   */
  async sRem(key, ...members) {
    try {
      const client = this.getClient();
      const stringMembers = members.map((m) =>
        typeof m === "object" ? JSON.stringify(m) : String(m)
      );
      return await client.sRem(key, stringMembers);
    } catch (error) {
      console.error(`❌ Redis SREM error for key ${key}:`, error.message);
      throw error;
    }
  }

  // ===== SORTED SET OPERATIONS =====

  /**
   * Add to sorted set
   */
  async zAdd(key, score, member) {
    try {
      const client = this.getClient();
      const stringMember =
        typeof member === "object" ? JSON.stringify(member) : String(member);
      return await client.zAdd(key, { score, value: stringMember });
    } catch (error) {
      console.error(`❌ Redis ZADD error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get sorted set range
   */
  async zRange(
    key,
    start = 0,
    stop = -1,
    withScores = false,
    parseJson = false
  ) {
    try {
      const client = this.getClient();
      const options = withScores ? { withScores: true } : {};
      const result = await client.zRange(key, start, stop, options);

      if (withScores && parseJson) {
        return result.map((item) => ({
          ...item,
          value: (() => {
            try {
              return JSON.parse(item.value);
            } catch {
              return item.value;
            }
          })(),
        }));
      } else if (parseJson && Array.isArray(result)) {
        return result.map((item) => {
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        });
      }

      return result;
    } catch (error) {
      console.error(`❌ Redis ZRANGE error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Remove from sorted set by score
   */
  async zRemRangeByScore(key, min, max) {
    try {
      const client = this.getClient();
      return await client.zRemRangeByScore(key, min, max);
    } catch (error) {
      console.error(
        `❌ Redis ZREMRANGEBYSCORE error for key ${key}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get sorted set cardinality
   */
  async zCard(key) {
    try {
      const client = this.getClient();
      return await client.zCard(key);
    } catch (error) {
      console.error(`❌ Redis ZCARD error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Remove specific member from sorted set
   */
  async zRem(key, member) {
    try {
      const client = this.getClient();
      const stringMember =
        typeof member === "object" ? JSON.stringify(member) : String(member);
      return await client.zRem(key, stringMember);
    } catch (error) {
      console.error(`❌ Redis ZREM error for key ${key}:`, error.message);
      throw error;
    }
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Get all keys matching pattern
   */
  async keys(pattern = "*") {
    try {
      const client = this.getClient();
      return await client.keys(pattern);
    } catch (error) {
      console.error(
        `❌ Redis KEYS error for pattern ${pattern}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Increment counter
   */
  async incr(key) {
    try {
      const client = this.getClient();
      return await client.incr(key);
    } catch (error) {
      console.error(`❌ Redis INCR error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Increment counter by amount
   */
  async incrBy(key, increment) {
    try {
      const client = this.getClient();
      return await client.incrBy(key, increment);
    } catch (error) {
      console.error(`❌ Redis INCRBY error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Decrement counter
   */
  async decr(key) {
    try {
      const client = this.getClient();
      return await client.decr(key);
    } catch (error) {
      console.error(`❌ Redis DECR error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Multi/Pipeline operations
   */
  multi() {
    try {
      const client = this.getClient();
      return client.multi();
    } catch (error) {
      console.error("❌ Redis MULTI error:", error.message);
      throw error;
    }
  }

  /**
   * Flush database
   */
  async flushDb() {
    try {
      const client = this.getClient();
      return await client.flushDb();
    } catch (error) {
      console.error("❌ Redis FLUSHDB error:", error.message);
      throw error;
    }
  }

  /**
   * Get database info
   */
  async info(section = "default") {
    try {
      const client = this.getClient();
      return await client.info(section);
    } catch (error) {
      console.error(
        `❌ Redis INFO error for section ${section}:`,
        error.message
      );
      throw error;
    }
  }
}

// Singleton instance
let redisInstance = null;

/**
 * Factory function để lấy Redis instance (Singleton)
 */
function getRedisHelper(options = {}) {
  if (!redisInstance) {
    redisInstance = new RedisHelper(options);

    // Auto cleanup khi app shutdown
    process.on("SIGINT", async () => {
      if (redisInstance) {
        await redisInstance.disconnect();
      }
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      if (redisInstance) {
        await redisInstance.disconnect();
      }
      process.exit(0);
    });
  }
  return redisInstance;
}

module.exports = {
  RedisHelper,
  getRedisHelper,
};
