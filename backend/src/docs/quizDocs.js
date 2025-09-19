"use strict";

/**
 * Quiz API Documentation
 */

const quizDocs = {
  createQuiz: {
    post: {
      summary: "Create a new quiz",
      tags: ["Quiz"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/QuizRequest" },
            example: {
              title: "Vocabulary Test 1",
              description: "Quiz for beginner words",
              questions: [
                {
                  wordId: "650f1f77bcf86cd799439012",
                  questionText: "What is the meaning of 'example'?",
                  options: ["A sample", "A mistake", "A rule"],
                  correctAnswer: "A sample",
                },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Quiz created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz created successfully",
                metadata: {
                  id: "671f1f77bcf86cd799439041",
                  title: "Vocabulary Test 1",
                  questionCount: 1,
                },
              },
            },
          },
        },
      },
    },
  },

  listQuizzes: {
    get: {
      summary: "List all quizzes",
      tags: ["Quiz"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Quizzes fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Quizzes fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "671f1f77bcf86cd799439041",
                      title: "Vocabulary Test 1",
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

  getQuiz: {
    get: {
      summary: "Get quiz by ID",
      tags: ["Quiz"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Quiz retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz retrieved successfully",
                metadata: {
                  id: "671f1f77bcf86cd799439041",
                  title: "Vocabulary Test 1",
                  description: "Quiz for beginner words",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  updateQuiz: {
    put: {
      summary: "Update quiz",
      tags: ["Quiz"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/QuizRequest" },
            example: { title: "Updated Vocabulary Test" },
          },
        },
      },
      responses: {
        200: {
          description: "Quiz updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz updated successfully",
                metadata: {
                  id: "671f1f77bcf86cd799439041",
                  title: "Updated Vocabulary Test",
                },
              },
            },
          },
        },
      },
    },
  },

  deleteQuiz: {
    delete: {
      summary: "Delete quiz",
      tags: ["Quiz"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Quiz deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Quiz deleted successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = quizDocs;
