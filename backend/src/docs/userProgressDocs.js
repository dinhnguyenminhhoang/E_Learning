"use strict";

/**
 * User Progress API Documentation
 */

const userProgressDocs = {
  createProgress: {
    post: {
      summary: "Create user progress record",
      tags: ["UserProgress"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserProgressRequest" },
            example: {
              userId: "507f1f77bcf86cd799439011",
              wordId: "650f1f77bcf86cd799439012",
              proficiency: "learning",
              correctCount: 3,
              incorrectCount: 1,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Progress created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Progress created successfully",
                metadata: {
                  id: "661f1f77bcf86cd799439031",
                  userId: "507f1f77bcf86cd799439011",
                  wordId: "650f1f77bcf86cd799439012",
                  proficiency: "learning",
                  correctCount: 3,
                  incorrectCount: 1,
                },
              },
            },
          },
        },
      },
    },
  },

  listProgress: {
    get: {
      summary: "List all user progress",
      tags: ["UserProgress"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "userId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Progress records fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Progress records fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "661f1f77bcf86cd799439031",
                      wordId: "650f1f77bcf86cd799439012",
                      proficiency: "learning",
                      correctCount: 3,
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

  updateProgress: {
    put: {
      summary: "Update user progress",
      tags: ["UserProgress"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserProgressRequest" },
            example: { proficiency: "mastered", correctCount: 10 },
          },
        },
      },
      responses: {
        200: {
          description: "Progress updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Progress updated successfully",
                metadata: {
                  id: "661f1f77bcf86cd799439031",
                  proficiency: "mastered",
                  correctCount: 10,
                },
              },
            },
          },
        },
      },
    },
  },

  deleteProgress: {
    delete: {
      summary: "Delete user progress record",
      tags: ["UserProgress"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Progress deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Progress deleted successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = userProgressDocs;
