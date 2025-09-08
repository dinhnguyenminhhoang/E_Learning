"use strict";

/**
 * Authentication API Documentation
 * Swagger definitions cho auth endpoints
 */

const authDocs = {
  // POST /v1/api//signup
  signup: {
    post: {
      summary: "Register a new user",
      tags: ["Authentication"],
      security: [], // No authentication required
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/SignUpRequest",
            },
            example: {
              name: "John Doe",
              email: "john@example.com",
              password: "SecurePassword123!",
              phoneNumber: "+84901234567",
              bio: "Passionate developer",
              skills: ["JavaScript", "React", "Node.js"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message: "Registration successful!",
                metadata: {
                  user: {
                    id: "507f1f77bcf86cd799439011",
                    name: "John Doe",
                    email: "john@example.com",
                    status: "pending",
                    verified: false,
                  },
                  emailVerificationRequired: true,
                  verificationEmailSent: true,
                },
              },
            },
          },
        },
        400: {
          $ref: "#/components/responses/ValidationError",
        },
      },
    },
  },

  // POST /v1/api//signin
  signin: {
    post: {
      summary: "User login",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/SignInRequest",
            },
            example: {
              email: "john@example.com",
              password: "SecurePassword123!",
              rememberMe: false,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          headers: {
            "Set-Cookie": {
              description: "HttpOnly cookie containing refresh token",
              schema: {
                type: "string",
                example:
                  "refreshToken=abc123...; HttpOnly; Secure; SameSite=Strict",
              },
            },
          },
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message: "Sign in successful!",
                metadata: {
                  user: {
                    id: "507f1f77bcf86cd799439011",
                    name: "John Doe",
                    email: "john@example.com",
                    roles: ["USER"],
                    verified: true,
                  },
                  tokens: {
                    accessToken: "eyJhbGciOiJSUzI1NiIs...",
                    tokenType: "Bearer",
                    expiresIn: 3600,
                  },
                  session: {
                    deviceId: "device_123",
                    deviceType: "web",
                    rememberMe: false,
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
        429: {
          $ref: "#/components/responses/RateLimitError",
        },
      },
    },
  },

  // POST /v1/api//refresh-token
  refreshToken: {
    post: {
      summary: "Refresh access token",
      tags: ["Authentication"],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Token refreshed successfully",
          headers: {
            "Set-Cookie": {
              description: "Updated HttpOnly cookie with new refresh token",
              schema: {
                type: "string",
              },
            },
          },
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message: "Token refreshed successfully!",
                metadata: {
                  accessToken: "eyJhbGciOiJSUzI1NiIs...",
                  tokenType: "Bearer",
                  expiresIn: 3600,
                  user: {
                    id: "507f1f77bcf86cd799439011",
                    email: "john@example.com",
                    roles: ["USER"],
                  },
                },
              },
            },
          },
        },
        401: {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    },
  },

  // POST /v1/api//signout
  signout: {
    post: {
      summary: "User logout",
      tags: ["Authentication"],
      security: [{ cookieAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                allDevices: {
                  type: "boolean",
                  description: "Logout from all devices",
                  default: false,
                  example: false,
                },
              },
            },
            example: {
              allDevices: false,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Logout successful",
          headers: {
            "Set-Cookie": {
              description: "Clears the refresh token cookie",
              schema: {
                type: "string",
                example:
                  "refreshToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
              },
            },
          },
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message: "Logged out successfully",
                metadata: {
                  revokedTokens: 1,
                  allDevices: false,
                  timestamp: "2024-08-16T10:30:00.000Z",
                },
              },
            },
          },
        },
        400: {
          $ref: "#/components/responses/ValidationError",
        },
      },
    },
  },

  // POST /v1/api//forgot-password
  forgotPassword: {
    post: {
      summary: "Request password reset",
      tags: ["Authentication"],
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password reset email sent (if email exists)",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message:
                  "If the email exists, a password reset link has been sent",
                metadata: {
                  emailSent: true,
                },
              },
            },
          },
        },
        400: {
          $ref: "#/components/responses/ValidationError",
        },
      },
    },
  },

  // GET /v1/api//verify-email
  verifyEmail: {
    get: {
      summary: "Verify email address",
      tags: ["Authentication"],
      security: [],
      parameters: [
        {
          name: "token",
          in: "query",
          required: true,
          description: "Email verification token",
          schema: {
            type: "string",
            example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
          },
        },
      ],
      responses: {
        200: {
          description: "Email verified successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message: "Email verified successfully!",
                metadata: {
                  user: {
                    id: "507f1f77bcf86cd799439011",
                    email: "john@example.com",
                    verified: true,
                    status: "active",
                  },
                  verifiedAt: "2024-08-16T10:30:00.000Z",
                },
              },
            },
          },
        },
        400: {
          description: "Invalid or expired token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                error: "Bad Request",
                message: "Invalid or expired verification token",
                code: "INVALID_TOKEN",
                timestamp: "2024-08-16T10:30:00.000Z",
              },
            },
          },
        },
      },
    },
  },
  // POST /v1/api/user/reset-password
  resetPassword: {
    post: {
      summary: "Reset user password with token",
      tags: ["Authentication"],
      security: [], // No authentication required
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token", "newPassword", "confirmPassword"],
              properties: {
                token: {
                  type: "string",
                  description: "Password reset token received via email",
                  example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
                },
                newPassword: {
                  type: "string",
                  format: "password",
                  description:
                    "New password (min 8 chars, must contain uppercase, lowercase, number, special character)",
                  example: "NewSecurePass123!",
                },
                confirmPassword: {
                  type: "string",
                  format: "password",
                  description: "Confirm new password (must match newPassword)",
                  example: "NewSecurePass123!",
                },
              },
            },
            example: {
              token: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
              newPassword: "NewSecurePass123!",
              confirmPassword: "NewSecurePass123!",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password reset successfully",
          headers: {
            "X-Password-Reset": {
              description: "Password reset status",
              schema: {
                type: "string",
                example: "success",
              },
            },
            "X-Sessions-Revoked": {
              description: "All sessions revoked for security",
              schema: {
                type: "string",
                example: "true",
              },
            },
          },
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                message:
                  "Password has been reset successfully. Please sign in with your new password.",
                metadata: {
                  user: {
                    id: "507f1f77bcf86cd799439011",
                    email: "john@example.com",
                    name: "John Doe",
                  },
                  security: {
                    allSessionsRevoked: true,
                    passwordChangedAt: "2024-08-16T10:30:00.000Z",
                  },
                  nextSteps: {
                    signIn: "https://portfolio-marketplace.com/signin",
                    setupTwoFactor:
                      "https://portfolio-marketplace.com/security/two-factor",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid input or token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                error: "Bad Request",
                message: "Invalid or expired reset token",
                code: "INVALID_TOKEN",
                timestamp: "2024-08-16T10:30:00.000Z",
              },
            },
          },
        },
        429: {
          description: "Too many reset attempts",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                error: "Too Many Requests",
                message:
                  "Too many password reset attempts. Please try again in 15 minutes.",
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: 900,
                timestamp: "2024-08-16T10:30:00.000Z",
              },
            },
          },
        },
      },
    },
  },
};

module.exports = authDocs;
