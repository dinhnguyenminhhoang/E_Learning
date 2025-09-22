"use strict";

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Import external documentation
const authDocs = require("../docs/authDocs");
// const userDocs = require('../docs/user.docs');

/**
 * Updated Swagger Configuration
 * Với external documentation files
 */

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Portfolio Marketplace API",
    version: "1.0.0",
    description:
      "Complete API documentation for Portfolio Marketplace application",
    contact: {
      name: "API Support",
      email: "support@portfolio-marketplace.com",
      url: "https://portfolio-marketplace.com/support",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || "http://localhost:8080",
      description: "Development server",
    },
    {
      url: "https://api.portfolio-marketplace.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token",
      },
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "Enter your API key",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description: "HttpOnly cookie containing refresh token",
      },
    },
    schemas: {
      // Common Response Schemas
      SuccessResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Operation successful",
          },
          metadata: {
            type: "object",
            description: "Response data",
          },
          options: {
            type: "object",
            properties: {
              limit: {
                type: "integer",
                example: 10,
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Bad Request",
          },
          message: {
            type: "string",
            example: "Validation failed",
          },
          code: {
            type: "string",
            example: "VALIDATION_ERROR",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2024-08-16T10:30:00.000Z",
          },
        },
      },
      // Auth Schemas
      SignUpRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "SecurePassword123!",
          },
          phoneNumber: {
            type: "string",
            example: "+84901234567",
          },
          bio: {
            type: "string",
            maxLength: 500,
            example: "Passionate developer",
          },
          website: {
            type: "string",
            example: "https://johndoe.com",
          },
          skills: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["JavaScript", "React"],
          },
        },
      },
      SignInRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            example: "SecurePassword123!",
          },
          rememberMe: {
            type: "boolean",
            example: false,
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              error: "Unauthorized",
              message: "Access token required",
              code: "AUTH_REQUIRED",
              timestamp: "2024-08-16T10:30:00.000Z",
            },
          },
        },
      },
      ForbiddenError: {
        description: "Insufficient permissions",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              error: "Forbidden",
              message: "Insufficient permissions",
              code: "INSUFFICIENT_PERMISSIONS",
              timestamp: "2024-08-16T10:30:00.000Z",
            },
          },
        },
      },
      ValidationError: {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              error: "Bad Request",
              message: "Validation failed: Name is required",
              code: "VALIDATION_ERROR",
              timestamp: "2024-08-16T10:30:00.000Z",
            },
          },
        },
      },
      RateLimitError: {
        description: "Rate limit exceeded",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              error: "Too Many Requests",
              message: "Rate limit exceeded. Try again in 300 seconds.",
              code: "RATE_LIMIT_EXCEEDED",
              timestamp: "2024-08-16T10:30:00.000Z",
            },
          },
        },
      },
    },
    // External documentation paths
    authPaths: authDocs,
    // userPaths: userDocs,
    // portfolioPaths: portfolioDocs
  },
  // Manual paths definition (using external docs)
  paths: {
    "/v1/api/user/signup": authDocs.signup,
    "/v1/api/user/signin": authDocs.signin,
    "/v1/api/user/refresh-token": authDocs.refreshToken,
    "/v1/api/user/signout": authDocs.signout,
    "/v1/api/user/forgot-password": authDocs.forgotPassword,
    "/v1/api/user/verify-email": authDocs.verifyEmail,
    "/v1/api/user/reset-password": authDocs.resetPassword,
  },
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization",
    },
    {
      name: "Users",
      description: "User management operations",
    },
    {
      name: "Portfolios",
      description: "Portfolio CRUD operations",
    },
    {
      name: "Admin",
      description: "Administrative operations",
    },
    {
      name: "Health",
      description: "System health and monitoring",
    },
  ],
};

// Options for swagger-jsdoc
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    "./src/routes/*.js", // Route files với @swagger comments
    "./src/controllers/*.js", // Controller files
    "./docs/*.yaml", // Additional YAML docs
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    docExpansion: "list",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .scheme-container { 
            background: #f7f7f7; 
            padding: 20px; 
            border-radius: 5px; 
        }
        .swagger-ui .info .title {
            color: #2c3e50;
            font-size: 2.5rem;
        }
        .swagger-ui .info .description {
            color: #7f8c8d;
            font-size: 1.1rem;
        }
    `,
  customSiteTitle: "Portfolio Marketplace API Documentation",
  customfavIcon: "/favicon.ico",
};

/**
 * Setup Swagger middleware
 * @param {Object} app - Express app instance
 */
function setupSwagger(app) {
  // Serve swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve swagger UI
  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Alternative routes
  app.get("/docs", (req, res) => {
    res.redirect("/api-docs");
  });

  // Health check for docs
  app.get("/docs/health", (req, res) => {
    res.json({
      status: "healthy",
      docs: {
        available: true,
        url: "/api-docs",
        version: swaggerSpec.info.version,
      },
      timestamp: new Date().toISOString(),
    });
  });

  console.log("📚 Swagger documentation available at:");
  console.log(`   - UI: http://localhost:${process.env.PORT || 8080}/api-docs`);
  console.log(
    `   - JSON: http://localhost:${process.env.PORT || 8080}/api-docs.json`
  );
  console.log(
    `   - Health: http://localhost:${process.env.PORT || 8080}/docs/health`
  );
}

/**
 * Get swagger specification
 * @returns {Object} Swagger specification
 */
function getSwaggerSpec() {
  return swaggerSpec;
}

module.exports = {
  setupSwagger,
  getSwaggerSpec,
  swaggerSpec,
  swaggerUiOptions,
};
