"use strict";

const { badRequestError, AuthFailureError } = require("../core/error.response");
const { CREATED, SuccessResponse } = require("../core/success.response");
const AuthService = require("../services/auth.service");
const { extractSessionData } = require("../utils");

class AuthController {
  singUp = async (req, res, next) => {
    console.log("call singUp api");
    new CREATED({
      message: "Register OK!",
      metadata: await AuthService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
  signIn = async (req, res, next) => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        throw new badRequestError("Email and password are required");
      }
      const sessionData = extractSessionData(req);
      const result = await AuthService.signIn(
        { email, password, rememberMe },
        sessionData
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: result.tokens.refreshExpiresIn * 1000, // Convert to milliseconds
        path: "/",
      };

      res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions);

      // Remove refresh token from response body for security
      const responseData = {
        ...result,
        tokens: {
          accessToken: result.tokens.accessToken,
          tokenType: result.tokens.tokenType,
          expiresIn: result.tokens.expiresIn,
        },
      };

      // Set additional headers for client
      res.set({
        "X-User-ID": result.user.id,
        "X-User-Roles": result.user.roles.join(","),
        "X-Session-ID": result.session.deviceId,
      });

      new SuccessResponse({
        message: "Sign in successful!",
        metadata: responseData,
      }).send(res);
    } catch (error) {
      console.error("❌ SignIn controller error:", error);
      next(new badRequestError(error));
    }
  };
  refreshToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new AuthFailureError("Refresh token not found");
      }
      const sessionData = {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
      };
      const result = await AuthService.refreshAccessToken(
        refreshToken,
        sessionData
      );

      if (result.refreshToken) {
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          path: "/",
        };
        res.cookie("refreshToken", result.refreshToken, cookieOptions);
        delete result.refreshToken;
      }

      new SuccessResponse({
        message: "Token refreshed successfully!",
        metadata: result,
      }).send(res);
    } catch (error) {
      if (error.message.includes("Invalid or expired")) {
        return next(new AuthFailureError(error.message));
      }

      next(new badRequestError(error.message));
    }
  };
  signOut = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const allDevices = req.body.allDevices === true;

      if (!refreshToken) {
        throw new badRequestError("Refresh token not found");
      }

      const result = await AuthService.signOut(refreshToken, allDevices);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      new SuccessResponse({
        message: result.message,
        metadata: {
          revokedTokens: result.revokedTokens,
          allDevices,
          timestamp: new Date().toISOString(),
        },
      }).send(res);
    } catch (error) {
      next(new badRequestError(error.message));
    }
  };
  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new badRequestError("Email is required");
      }
      const result = await AuthService.forgotPassword(email);
      new SuccessResponse({
        message: result.message,
        metadata: {
          emailSent: result.emailSent,
          resetToken: result.resetToken,
        },
      }).send(res);
    } catch (error) {
      console.error("❌ ForgotPassword controller error:", error);
      next(new badRequestError(error.message));
    }
  };
  verifyEmail = async (req, res, next) => {
    try {
      const { token } = req.query;
      if (!token) {
        throw new badRequestError("Verification token is required");
      }

      const result = await AuthService.verifyEmail(token);

      res.set({
        "X-Verification-Status": "success",
        "X-User-Verified": "true",
      });
      new SuccessResponse({
        message: result.message,
        metadata: {
          user: result.user,
          nextSteps: result.nextSteps,
          alreadyVerified: result.alreadyVerified || false,
          timestamp: new Date().toISOString(),
        },
      }).send(res);
    } catch (error) {
      console.error("❌ VerifyEmail controller error:", error);
      res.set({
        "X-Verification-Status": "failed",
        "X-Error-Type": error.message.includes("expired")
          ? "expired"
          : error.message.includes("Invalid")
            ? "invalid"
            : "unknown",
      });
      next(new badRequestError(error.message));
    }
  };
  resetPassword = async (req, res, next) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token) {
        throw new badRequestError("Reset token is required");
      }

      if (!newPassword || !confirmPassword) {
        throw new badRequestError(
          "New password and confirm password are required"
        );
      }

      const result = await AuthService.resetPassword(
        token,
        newPassword,
        confirmPassword
      );
      res.set({
        "X-Password-Reset": "success",
        "X-Sessions-Revoked": "true",
        "X-Security-Action": "password-changed",
      });

      new SuccessResponse({
        message: result.message,
        metadata: {
          user: result.user,
          security: result.security,
          nextSteps: result.nextSteps,
          timestamp: new Date().toISOString(),
        },
      }).send(res);
    } catch (error) {
      console.error("❌ ResetPassword controller error:", error);
      res.set({
        "X-Password-Reset": "failed",
        "X-Error-Type": error.message.includes("expired")
          ? "expired"
          : error.message.includes("Invalid")
            ? "invalid"
            : error.message.includes("match")
              ? "validation"
              : "unknown",
      });

      next(new badRequestError(error.message));
    }
  };
}
module.exports = new AuthController();
