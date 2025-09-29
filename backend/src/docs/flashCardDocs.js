"use strict";

const flashcardDocs = {
  // POST /v1/api/flashcard
  createFlashcard: {
    post: {
      summary: "Create a new flashcard",
      tags: ["Flashcard"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/FlashcardRequest" },
            example: {
              word: "650f8c1f8f8f8f8f8f8f8f8f",
              frontText: "What is a closure in JavaScript?",
              backText: "A closure is a function that has access to its outer scope even after the outer function has returned.",
              cardDeck: "650f8c1f8f8f8f8f8f8f8f99",
              difficulty: "medium",
              tags: ["javascript", "functions", "interview"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Flashcard created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Flashcard created successfully",
                metadata: {
                  id: "650f8c1f8f8f8f8f8f8f8f8a",
                  word: "650f8c1f8f8f8f8f8f8f8f8f",
                  frontText: "What is a closure in JavaScript?",
                  backText: "A closure is a function ...",
                  cardDeck: "650f8c1f8f8f8f8f8f8f8f99",
                  difficulty: "medium",
                  status: "active",
                  createdAt: "2024-08-16T10:30:00.000Z",
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },

  // GET /v1/api/flashcard
  listFlashcards: {
    get: {
      summary: "Get all flashcards",
      tags: ["Flashcard"],
      security: [],
      parameters: [],
      responses: {
        200: {
          description: "List of flashcards",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Flashcards retrieved successfully",
                metadata: [
                  {
                    id: "650f8c1f8f8f8f8f8f8f8f8a",
                    frontText: "What is a closure in JavaScript?",
                    backText: "A closure is a function ...",
                    difficulty: "medium",
                    status: "active",
                  },
                  {
                    id: "650f8c1f8f8f8f8f8f8f8f8b",
                    frontText: "Explain CSS Flexbox",
                    backText: "Flexbox is a CSS layout mode ...",
                    difficulty: "easy",
                    status: "active",
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

  // GET /v1/api/flashcard/{id}
  getFlashcardById: {
    get: {
      summary: "Get flashcard by ID",
      tags: ["Flashcard"],
      security: [],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Flashcard ID",
        },
      ],
      responses: {
        200: {
          description: "Flashcard details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Flashcard retrieved successfully",
                metadata: {
                  id: "650f8c1f8f8f8f8f8f8f8f8a",
                  word: "650f8c1f8f8f8f8f8f8f8f8f",
                  frontText: "What is a closure in JavaScript?",
                  backText: "A closure is a function ...",
                  cardDeck: "650f8c1f8f8f8f8f8f8f8f99",
                  difficulty: "medium",
                  status: "active",
                  createdAt: "2024-08-16T10:30:00.000Z",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  // PUT /v1/api/flashcard/{id}
  updateFlashcard: {
    put: {
      summary: "Update a flashcard",
      tags: ["Flashcard"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Flashcard ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/FlashcardRequest" },
            example: {
              frontText: "Updated front text",
              backText: "Updated back text",
              difficulty: "hard",
              tags: ["updated", "study"],
              status: "active",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Flashcard updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Flashcard updated successfully",
                metadata: {
                  id: "650f8c1f8f8f8f8f8f8f8f8a",
                  frontText: "Updated front text",
                  backText: "Updated back text",
                  difficulty: "hard",
                  status: "active",
                  updatedAt: "2024-08-18T08:45:00.000Z",
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  // DELETE /v1/api/flashcard/{id}
  deleteFlashcard: {
    delete: {
      summary: "Soft delete a flashcard",
      tags: ["Flashcard"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Flashcard ID",
        },
      ],
      responses: {
        200: {
          description: "Flashcard deleted successfully (soft delete)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Flashcard deleted successfully",
                metadata: {
                  id: "650f8c1f8f8f8f8f8f8f8f8a",
                  status: "inactive",
                  deletedAt: "2024-08-19T12:00:00.000Z",
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};

module.exports = flashcardDocs;
