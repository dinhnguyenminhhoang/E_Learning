const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const userRepository = require("../repositories/user.repo");
const keyTokenRepository = require("../repositories/keyToken.repo");
const userLearningPathRepo = require("../repositories/userLearningPath.repo");
const jwtHelper = require("../helpers/jwtHelper");
const client = new OAuth2Client(process.env.OAUTH2_CLIENT_ID);
const jwt = require("jsonwebtoken");
const { STATUS } = require("../constants/status.constans");

class GoogleAuthService {
  async verifyToken(token) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH2_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  async loginWithGoogle(token, sessionData = {}) {
    const {
      deviceType = "web",
      userAgent,
      ipAddress,
      rememberMe = false,
    } = sessionData;
    const payload = await this.verifyToken(token);
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || `${payload.given_name} ${payload.family_name}`,
        email: payload.email,
        picture: payload.picture,
        provider: "google",
        status: STATUS.ACTIVE,
        roles: ["USER"],
        verification: {
          emailVerified: true,
          phoneVerified: false,
          twoFactorEnabled: false,
        },
        profile: {
          avatar: payload.picture,
        },
      });
    }

    const existingToken = await keyTokenRepository.findByUserAndDevice(
      user._id,
      sessionData.deviceId
    );
    if (existingToken) {
      await keyTokenRepository.revokeToken(existingToken._id, "new_login");
    }

    const tokenExpiry = rememberMe ? 30 : 7; // 30 days if remember me, 7 days otherwise

    const { keyToken, publicKey, refreshToken } =
      await keyTokenRepository.createWithKeyPair(
        user._id,
        {
          deviceType,
          userAgent: userAgent || "Unknown",
          ipAddress: ipAddress || "127.0.0.1",
          location: sessionData.location || {},
        },
        {
          expiresInDays: tokenExpiry,
          keySize: 2048,
        }
      );
    const fullKeyToken = await keyTokenRepository.findById(keyToken._id, {
      includePrivateKey: true,
    });
    const accessToken = jwtHelper.generateAccessToken(
      {
        userId: user._id,
        email: user.email,
        roles: user.roles,
        keyId: keyToken._id,
        verified: user.verification?.emailVerified || false,
      },
      fullKeyToken.keys.privateKey,
      {
        expiresIn: "1h",
        subject: user._id.toString(),
      }
    );
    await userRepository.updatePortfolioStats(user._id, {
      lastLoginAt: new Date(),
    });
    console.log("user._id", user._id);
    const learningPath = await userLearningPathRepo.findByUserId(user._id);
    console.log("learningPath", learningPath ?? "no learning path");
    
    // 13. Prepare response
    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        roles: user.roles,
        verified: user.verification?.emailVerified || false,
        avatar: user.profile?.avatar,
        lastLoginAt: new Date(),
        portfolioCount: user.portfolios?.owned?.length || 0,
        learningPathId: learningPath && learningPath.length > 0 ? learningPath[0].learningPath._id : "",
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 3600, // 1 hour in seconds
        refreshExpiresIn: tokenExpiry * 24 * 60 * 60, // in seconds
      },
      session: {
        deviceId: keyToken.session?.deviceId,
        deviceType: keyToken.session?.deviceType,
        rememberMe,
      },
    };
    return response;
  }
}

module.exports = new GoogleAuthService();
