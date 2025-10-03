"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repo");
const keyTokenRepository = require("../repositories/keyToken.repo");
const { getRedisHelper } = require("../helpers/redisHelper");
const { isValidEmail, generateVerificationToken } = require("../utils");
const { NotFoundError } = require("../core/error.response");
const jwtHelper = require("../helpers/jwtHelper");
const sendEmail = require("../helpers/sendEmail");
const { sendTemplatedEmail } = require("../extensions/email.extension");

class AuthService {
  static signUp = async (userData) => {
    try {
      const { name, email, password, phoneNumber } = userData;

      if (!name || name.trim().length < 2) {
        throw new Error("Name must be at least 2 characters long");
      }

      if (!email || !isValidEmail(email)) {
        throw new Error("Valid email address is required");
      }

      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error("Email already registered");
      }
      const newUserData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        phoneNumber: phoneNumber?.trim() || null,
        roles: ["USER"],
        status: "pending",
        verification: {
          emailVerified: false,
          phoneVerified: false,
          twoFactorEnabled: false,
        },
      };
      const newUser = await userRepository.create(newUserData);

      const verificationToken = await generateVerificationToken(newUser._id);
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const emailData = {
        to: newUser.email,
        subject: "Verify Your Email Address - Portfolio Marketplace",
        template: "verification",
        data: {
          name: newUser.name,
          verificationUrl,
          expiresIn: "24 hours",
        },
      };
      await sendTemplatedEmail(emailData);
      return {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          status: newUser.status,
          verified: false,
          createdAt: newUser.createdAt,
        },
        message:
          "Registration successful. Please check your email for verification.",
        verificationToken:
          process.env.NODE_ENV === "development"
            ? verificationToken
            : undefined,
      };
    } catch (error) {
      console.error("❌ SignUp error:", error);
      throw error;
    }
  };
  static signIn = async (loginData, sessionData = {}) => {
    try {
      const { email, password, rememberMe = false } = loginData;
      const { deviceType = "web", userAgent, ipAddress } = sessionData;

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (!isValidEmail(email)) {
        throw new Error("Invalid email format");
      }

      const user = await userRepository.findByEmail(email, {
        includePassword: true,
        includeDeleted: false,
      });
      console.log(user);

      if (!user) {
        console.warn(`🚨 Login attempt with non-existent email: ${email}`);
        throw new Error("Invalid email or password");
      }
      if (user.security?.lockUntil && user.security.lockUntil > Date.now()) {
        const lockTimeRemaining = Math.ceil(
          (user.security.lockUntil - Date.now()) / (1000 * 60)
        );
        throw new Error(
          `Account is locked. Try again in ${lockTimeRemaining} minutes`
        );
      }

      if (user.status === "inactive") {
        throw new Error("Account is deactivated. Please contact support");
      }

      if (user.status === "suspended") {
        throw new Error("Account is suspended. Please contact support");
      }
      const isPasswordValid = await userRepository.comparePassword(
        user._id,
        password
      );

      if (!isPasswordValid) {
        await userRepository.incrementLoginAttempts(user._id);

        console.warn(
          `🚨 Invalid password attempt for: ${email} from IP: ${ipAddress}`
        );
        throw new Error("Invalid email or password");
      }

      if (
        !user.verification?.emailVerified &&
        process.env.REQUIRE_EMAIL_VERIFICATION === "true"
      ) {
        throw new Error("Please verify your email before signing in");
      }
      await userRepository.updateLoginInfo(user._id, {
        ipAddress,
        userAgent,
      });

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
    } catch (error) {
      console.error("❌ SignIn error:", error);
      throw error;
    }
  };
  static refreshAccessToken = async (refreshToken, sessionData = {}) => {
    try {
      if (!refreshToken) {
        throw new NotFoundError("Refresh token is required");
      }

      const keyToken = await keyTokenRepository.findByRefreshToken(
        refreshToken,
        {
          includeExpired: false,
          includeRevoked: false,
        }
      );

      if (!keyToken) {
        throw new NotFoundError("Invalid or expired refresh token");
      }

      const user = await userRepository.findById(keyToken.user._id);
      if (!user || user.status !== "active") {
        throw new NotFoundError("User not found or inactive");
      }
      const { newRefreshToken, publicKey } =
        await keyTokenRepository.refreshToken(refreshToken, {
          userAgent: sessionData.userAgent,
          ipAddress: sessionData.ipAddress,
        });
      const fullKeyToken = await keyTokenRepository.findById(keyToken._id, {
        includePrivateKey: true,
      });
      const newAccessToken = jwtHelper.generateAccessToken(
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
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
        expiresIn: 3600,
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles,
          verified: user.verification?.emailVerified || false,
        },
      };
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      throw error;
    }
  };
  static signOut = async (refreshToken, allDevices = false) => {
    try {
      if (!refreshToken) {
        throw new NotFoundError("Refresh token is required");
      }
      const keyToken = await keyTokenRepository.findByRefreshToken(
        refreshToken,
        {
          includeExpired: true,
          includeRevoked: false,
        }
      );

      if (!keyToken) {
        throw new NotFoundError("Token not found");
      }

      const userId = keyToken.user._id;

      if (allDevices) {
        const result = await keyTokenRepository.revokeAllUserTokens(
          userId,
          "logout_all_devices"
        );
        return {
          message: "Logged out from all devices successfully",
          revokedTokens: result.revokedCount,
        };
      } else {
        await keyTokenRepository.revokeByRefreshToken(
          refreshToken,
          "user_logout"
        );
        return {
          message: "Logged out successfully",
          revokedTokens: 1,
        };
      }
    } catch (error) {
      console.error("❌ SignOut error:", error);
      throw error;
    }
  };
  static forgotPassword = async (email) => {
    try {
      if (!email || !isValidEmail(email)) {
        throw new Error("Valid email is required");
      }
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return {
          message: "If the email exists, a password reset link has been sent",
          emailSent: false,
        };
      }
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const redis = getRedisHelper();
      await redis.set(
        `password_reset:${resetToken}`,
        JSON.stringify({
          userId: user._id,
          email: user.email,
          expiresAt,
          createdAt: Date.now(),
        }),
        { ttl: 3600 }
      ); // 1 hour TTL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-passsword?token=${resetToken}`;

      const emailData = {
        to: user.email,
        subject: "Reset Your Password - Portfolio Marketplace",
        template: "forgot-password",
        data: {
          name: user.name,
          resetUrl,
          expiresIn: "1 hour",
        },
      };
      await sendTemplatedEmail(emailData);
      return {
        message: "If the email exists, a password reset link has been sent",
        emailSent: true,
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
      };
    } catch (error) {
      console.error("❌ Forgot password error:", error);
      throw error;
    }
  };
  static verifyEmail = async (token) => {
    try {
      if (!token) {
        throw new NotFoundError("Verification token is required");
      }
      if (typeof token !== "string" || token.length < 10) {
        throw new Error("Invalid token format");
      }
      const redis = getRedisHelper();

      const verificationData = await redis.get(
        `email_verification:${token}`,
        true
      );

      if (!verificationData) {
        throw new Error("Invalid or expired verification token");
      }
      if (
        verificationData.expiresAt &&
        new Date(verificationData.expiresAt) < new Date()
      ) {
        await redis.del(`email_verification:${token}`);
        throw new Error("Verification token has expired");
      }
      const user = await userRepository.findById(verificationData.userId);
      if (!user) {
        await redis.del(`email_verification:${token}`);
        throw new NotFoundError("User not found");
      }
      if (user.verification?.emailVerified) {
        await redis.del(`email_verification:${token}`);
        return {
          message: "Email is already verified",
          user: {
            id: user._id,
            email: user.email,
            verified: true,
          },
          alreadyVerified: true,
        };
      }
      const verifiedUser = await userRepository.verifyEmail(user._id);
      await redis.del(`email_verification:${token}`);
      await userRepository.logActivity(user._id, "email_verified", {
        verifiedAt: new Date(),
        method: "email_token",
      });
      try {
        const welcomeEmailData = {
          to: user.email,
          subject: "Welcome to Portfolio Marketplace! 🎉",
          template: "welcome",
          data: {
            name: user.name,
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
            supportUrl: `${process.env.FRONTEND_URL}/support`,
          },
        };

        await sendTemplatedEmail(welcomeEmailData);
      } catch (emailError) {
        console.error("❌ Failed to send welcome email:", emailError);
      }
      return {
        message:
          "Email verified successfully! Welcome to Portfolio Marketplace!",
        user: {
          id: verifiedUser._id,
          name: verifiedUser.name,
          email: verifiedUser.email,
          status: verifiedUser.status,
          verified: true,
          verifiedAt: verifiedUser.verification.emailVerifiedAt,
        },
        nextSteps: {
          canLogin: true,
          setupProfile: `${process.env.FRONTEND_URL}/profile/setup`,
          dashboard: `${process.env.FRONTEND_URL}/dashboard`,
        },
      };
    } catch (error) {
      console.error("❌ Email verification error:", error);
      if (error.message.includes("User not found")) {
        console.warn(
          `🚨 Verification attempt with invalid user token: ${token.substring(0, 8)}...`
        );
      }
      throw error;
    }
  };
  static resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      if (!token) {
        throw new NotFoundError("Reset token is required");
      }

      if (!newPassword || !confirmPassword) {
        throw new NotFoundError(
          "New password and confirm password are required"
        );
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(newPassword)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      const redis = getRedisHelper();
      const resetData = await redis.get(`password_reset:${token}`, true);
      if (!resetData) {
        throw new Error("Invalid or expired reset token");
      }
      if (resetData.expiresAt && new Date(resetData.expiresAt) < new Date()) {
        await redis.del(`password_reset:${token}`);
        throw new Error("Reset token has expired");
      }

      const user = await userRepository.findById(resetData.userId);
      if (!user) {
        await redis.del(`password_reset:${token}`);
        throw new NotFoundError("User not found");
      }

      if (user.status === "suspended" || user.status === "inactive") {
        throw new Error("Account is not available for password reset");
      }

      const isSamePassword = await userRepository.comparePassword(
        user._id,
        newPassword
      );
      if (isSamePassword) {
        throw new Error(
          "New password must be different from your current password"
        );
      }

      await userRepository.updatePassword(user._id, newPassword, {
        revokeTokens: true,
        logActivity: true,
      });

      await redis.del(`password_reset:${token}`);

      await keyTokenRepository.revokeAllUserTokens(user._id, "password_reset");

      await userRepository.logActivity(user._id, "password_reset", {
        resetAt: new Date(),
        method: "email_token",
        ipAddress: resetData.ipAddress || "unknown",
      });

      try {
        const confirmationEmailData = {
          to: user.email,
          subject: "Password Reset Successful - Portfolio Marketplace",
          template: "password-reset",
          data: {
            name: user.name,
            resetTime: new Date().toISOString(),
            ipAddress: resetData.ipAddress || "Unknown",
            loginUrl: `${process.env.FRONTEND_URL}/signin`,
            supportUrl: `${process.env.FRONTEND_URL}/support`,
          },
        };

        await sendTemplatedEmail(confirmationEmailData);
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError);
      }
      return {
        message:
          "Password has been reset successfully. Please sign in with your new password.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        security: {
          allSessionsRevoked: true,
          passwordChangedAt: new Date(),
        },
        nextSteps: {
          signIn: `${process.env.FRONTEND_URL}/signin`,
          setupTwoFactor: `${process.env.FRONTEND_URL}/security/two-factor`,
        },
      };
    } catch (error) {
      console.error("❌ Password reset error:", error);
      throw error;
    }
  };
}

module.exports = AuthService;
