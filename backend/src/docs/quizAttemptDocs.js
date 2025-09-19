"use strict";

/**
 * Quiz Attempt API Documentation
 */

const quizAttemptDocs = {
  createAttempt: {
    post: {
      summary: "Start a new quiz attempt",
      tags: ["QuizAttempt"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/QuizAttemptRequest" },
            example: {
              quizId: "671f1f77bcf86cd799439041",
              userId: "507f1f77bcf86cd799439011",
              answers: [
                {
                  questionId: "701f1f77bcf86cd799439051",
                  selectedAnswer: "A sample",
                },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Quiz attempt started successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz attempt started successfully",
                metadata: {
                  id: "681f1f77bcf86cd799439061",
                  quizId: "671f1f77bcf86cd799439041",
                  userId: "507f1f77bcf86cd799439011",
                  score: 0,
                  status: "in-progress",
                },
              },
            },
          },
        },
      },
    },
  },

  listAttempts: {
    get: {
      summary: "List all quiz attempts",
      tags: ["QuizAttempt"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "quizId", in: "query", schema: { type: "string" } },
        { name: "userId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Quiz attempts fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Quiz attempts fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "681f1f77bcf86cd799439061",
                      quizId: "671f1f77bcf86cd799439041",
                      userId: "507f1f77bcf86cd799439011",
                      score: 80,
                      status: "completed",
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

  getAttempt: {
    get: {
      summary: "Get quiz attempt by ID",
      tags: ["QuizAttempt"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Quiz attempt retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz attempt retrieved successfully",
                metadata: {
                  id: "681f1f77bcf86cd799439061",
                  quizId: "671f1f77bcf86cd799439041",
                  score: 80,
                  answers: [
                    {
                      questionId: "701f1f77bcf86cd799439051",
                      selectedAnswer: "A sample",
                      correct: true,
                    },
                  ],
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  updateAttempt: {
    put: {
      summary: "Update quiz attempt (submit answers, update score)",
      tags: ["QuizAttempt"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/QuizAttemptRequest" },
            example: { score: 85, status: "completed" },
          },
        },
      },
      responses: {
        200: {
          description: "Quiz attempt updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz attempt updated successfully",
                metadata: {
                  id: "681f1f77bcf86cd799439061",
                  score: 85,
                  status: "completed",
                },
              },
            },
          },
        },
      },
    },
  },

  deleteAttempt: {
    delete: {
      summary: "Delete quiz attempt",
      tags: ["QuizAttempt"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Quiz attempt deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz attempt deleted successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = quizAttemptDocs;
