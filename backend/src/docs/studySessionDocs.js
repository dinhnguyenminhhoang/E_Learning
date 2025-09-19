"use strict";

/**
 * Study Session API Documentation
 */

const studySessionDocs = {
  createSession: {
    post: {
      summary: "Start a new study session",
      tags: ["StudySession"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/StudySessionRequest" },
            example: {
              userId: "507f1f77bcf86cd799439011",
              startTime: "2025-09-19T10:00:00.000Z",
              focusLevel: "high",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Study session started successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Study session started successfully",
                metadata: {
                  id: "691f1f77bcf86cd799439071",
                  userId: "507f1f77bcf86cd799439011",
                  startTime: "2025-09-19T10:00:00.000Z",
                  status: "active",
                },
              },
            },
          },
        },
      },
    },
  },

  listSessions: {
    get: {
      summary: "List all study sessions",
      tags: ["StudySession"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "userId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Study sessions fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Study sessions fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "691f1f77bcf86cd799439071",
                      startTime: "2025-09-19T10:00:00.000Z",
                      duration: 3600,
                      focusLevel: "high",
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

  getSession: {
    get: {
      summary: "Get study session by ID",
      tags: ["StudySession"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Study session retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Study session retrieved successfully",
                metadata: {
                  id: "691f1f77bcf86cd799439071",
                  startTime: "2025-09-19T10:00:00.000Z",
                  endTime: "2025-09-19T11:00:00.000Z",
                  duration: 3600,
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  updateSession: {
    put: {
      summary: "Update study session (end session, update duration)",
      tags: ["StudySession"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/StudySessionRequest" },
            example: { endTime: "2025-09-19T11:00:00.000Z" },
          },
        },
      },
      responses: {
        200: {
          description: "Study session updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Study session updated successfully",
                metadata: {
                  id: "691f1f77bcf86cd799439071",
                  duration: 3600,
                  status: "completed",
                },
              },
            },
          },
        },
      },
    },
  },

  deleteSession: {
    delete: {
      summary: "Delete study session",
      tags: ["StudySession"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Study session deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Study session deleted successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = studySessionDocs;
