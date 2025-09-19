"use strict";

/**
 * Word API Documentation
 */

const wordDocs = {
  // POST /v1/api/words
  createWord: {
    post: {
      summary: "Create a new word",
      tags: ["Word"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/WordRequest" },
            example: {
              word: "example",
              pronunciation: "/ɪɡˈzɑːmpl/",
              audio: "https://cdn.example.com/audio/example.mp3",
              partOfSpeech: "noun",
              level: "beginner",
              definitions: [
                {
                  meaning: "A representative form or pattern",
                  meaningVi: "Ví dụ, hình mẫu",
                  examples: [
                    {
                      sentence: "This sentence is an example.",
                      translation: "Câu này là một ví dụ.",
                    },
                  ],
                },
              ],
              categories: ["650f1f77bcf86cd799439011"],
              tags: ["academic"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Word created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Word created successfully!",
                metadata: {
                  id: "650f1f77bcf86cd799439012",
                  word: "example",
                  pronunciation: "/ɪɡˈzɑːmpl/",
                  partOfSpeech: "noun",
                  level: "beginner",
                  createdAt: "2025-09-19T10:30:00.000Z",
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },

  // GET /v1/api/words
  listWords: {
    get: {
      summary: "List all words",
      tags: ["Word"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Words fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Words fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "650f1f77bcf86cd799439012",
                      word: "example",
                      pronunciation: "/ɪɡˈzɑːmpl/",
                      partOfSpeech: "noun",
                      level: "beginner",
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

  // GET /v1/api/words/:id
  getWord: {
    get: {
      summary: "Get word by ID",
      tags: ["Word"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Word fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Word retrieved successfully",
                metadata: {
                  id: "650f1f77bcf86cd799439012",
                  word: "example",
                  pronunciation: "/ɪɡˈzɑːmpl/",
                  partOfSpeech: "noun",
                  level: "beginner",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  // PUT /v1/api/words/:id
  updateWord: {
    put: {
      summary: "Update word",
      tags: ["Word"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/WordRequest" },
            example: {
              word: "example-updated",
              level: "intermediate",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Word updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Word updated successfully",
                metadata: {
                  id: "650f1f77bcf86cd799439012",
                  word: "example-updated",
                  level: "intermediate",
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },

  // DELETE /v1/api/words/:id
  deleteWord: {
    delete: {
      summary: "Delete word",
      tags: ["Word"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Word deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Word deleted successfully",
                metadata: { deleted: true },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};

module.exports = wordDocs;
