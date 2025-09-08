const { getRedisHelper } = require("../helpers/redisHelper");
const crypto = require("crypto");
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const extractSessionData = (req) => {
  return {
    deviceType: req.headers["x-device-type"] || "web",
    deviceId: req.headers["x-device-id"] || req.sessionID || "unknown",
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip || req.connection?.remoteAddress || "0.0.0.0",
    location: {
      country:
        req.headers["x-country"] || req.headers["cf-ipcountry"] || "Unknown",
      city: req.headers["x-city"] || "Unknown",
      timezone: req.headers["x-timezone"] || "UTC",
    },
  };
};
const generateVerificationToken = async (userId) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store in Redis
    const redis = getRedisHelper();
    await redis.connect();
    await redis.set(
      `email_verification:${token}`,
      JSON.stringify({
        userId,
        expiresAt,
        createdAt: Date.now(),
      }),
      { ttl: 86400 }
    ); // 24 hours TTL

    return token;
  } catch (error) {
    console.error("❌ Error generating verification token:", error);
    throw new Error("Failed to generate verification token");
  }
};
module.exports = {
  isValidEmail,
  extractSessionData,
  generateVerificationToken,
};
