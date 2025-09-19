"use strict";

/**
 * Achievement API Documentation
 */

const achievementDocs = {
  createAchievement: {
    post: {
      summary: "Create a new achievement",
      tags: ["Achievement"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AchievementRequest" },
            example: {
              title: "First 100 Words",
              description: "Learn your first 100 vocabulary words",
              icon: "https://example.com/icons/first100.png",
              points: 50,
              category: "Milestone",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Achievement created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Achievement created successfully",
                metadata: {
                  id: "701f1f77bcf86cd799439081",
                  title: "First 100 Words",
                  points: 50,
                },
              },
            },
          },
        },
      },
    },
  },

  listAchievements: {
    get: {
      summary: "List all achievements",
      tags: ["Achievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "category", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Achievements fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Achievements fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "701f1f77bcf86cd799439081",
                      title: "First 100 Words",
                      points: 50,
                      category: "Milestone",
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

  getAchievement: {
    get: {
      summary: "Get achievement by ID",
      tags: ["Achievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Achievement retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Achievement retrieved successfully",
                metadata: {
                  id: "701f1f77bcf86cd799439081",
                  title: "First 100 Words",
                  description: "Learn your first 100 vocabulary words",
                  points: 50,
                  category: "Milestone",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  updateAchievement: {
    put: {
      summary: "Update achievement details",
      tags: ["Achievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AchievementRequest" },
            example: { points: 100, category: "Progress" },
          },
        },
      },
      responses: {
        200: {
          description: "Achievement updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Achievement updated successfully",
                metadata: {
                  id: "701f1f77bcf86cd799439081",
                  points: 100,
                  category: "Progress",
                },
              },
            },
          },
        },
      },
    },
  },

  deleteAchievement: {
    delete: {
      summary: "Delete achievement",
      tags: ["Achievement"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Achievement deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Achievement deleted successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = achievementDocs;
