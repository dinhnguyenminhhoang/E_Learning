"use strict";

/**
 * User Achievement API Documentation
 */

const userAchievementDocs = {
  assignAchievement: {
    post: {
      summary: "Assign an achievement to a user",
      tags: ["UserAchievement"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserAchievementRequest" },
            example: {
              userId: "507f1f77bcf86cd799439011",
              achievementId: "701f1f77bcf86cd799439081",
              unlockedAt: "2025-09-19T10:00:00.000Z",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Achievement assigned to user successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Achievement assigned successfully",
                metadata: {
                  userId: "507f1f77bcf86cd799439011",
                  achievementId: "701f1f77bcf86cd799439081",
                  unlockedAt: "2025-09-19T10:00:00.000Z",
                },
              },
            },
          },
        },
      },
    },
  },

  listUserAchievements: {
    get: {
      summary: "List all achievements of a user",
      tags: ["UserAchievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "userId", in: "query", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "User achievements fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "User achievements fetched successfully",
                metadata: {
                  items: [
                    {
                      achievementId: "701f1f77bcf86cd799439081",
                      title: "First 100 Words",
                      unlockedAt: "2025-09-19T10:00:00.000Z",
                    },
                  ],
                  total: 1,
                  page: 1,
                  limit: 10,
                },
              },
            },
          },
        },
      },
    },
  },

  getUserAchievement: {
    get: {
      summary: "Get a specific user achievement",
      tags: ["UserAchievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "User achievement retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "User achievement retrieved successfully",
                metadata: {
                  id: "711f1f77bcf86cd799439091",
                  userId: "507f1f77bcf86cd799439011",
                  achievementId: "701f1f77bcf86cd799439081",
                  unlockedAt: "2025-09-19T10:00:00.000Z",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  deleteUserAchievement: {
    delete: {
      summary: "Remove an achievement from a user",
      tags: ["UserAchievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "User achievement removed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "User achievement removed successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = userAchievementDocs;
