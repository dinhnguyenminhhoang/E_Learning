"use strict";

const { STATUS } = require("../constants/status.constans.js");

const cardDeckDocs = {
  // POST /v1/api/card-deck/
  createCardDeck: {
    post: {
      summary: "Create a new card deck",
      tags: ["Card Deck"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CardDeckRequest" },
            example: {
              title: "Basic Programming Concepts",
              description: "Flashcards for fundamental programming concepts.",
              target: "652ea43f4b2a0e9b3b8e12f7",
              level: "beginner",
              categoryId: "652ea53e4b2a0e9b3b8e12f8",
              thumbnail: "https://example.com/thumbnail.png",
              status: STATUS.ACTIVE,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Card deck created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Card deck created successfully",
                metadata: {
                  id: "652eb1af4b2a0e9b3b8e1300",
                  title: "Basic Programming Concepts",
                  target: "652ea43f4b2a0e9b3b8e12f7",
                  level: "beginner",
                  status: STATUS.ACTIVE,
                  createdAt: "2024-08-20T10:30:00.000Z",
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

  // GET /v1/api/card-deck/
  getListCardDecks: {
    get: {
      summary: "Get all card decks",
      tags: ["Card Deck"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "pageNum",
          in: "query",
          schema: { type: "integer", example: 1 },
          description: "Current page number (default: 1)",
        },
        {
          name: "pageSize",
          in: "query",
          schema: { type: "integer", example: 10 },
          description: "Number of items per page (default: 10)",
        },
        {
          name: "target",
          in: "query",
          schema: { type: "string", example: "652ea43f4b2a0e9b3b8e12f7" },
          description: "Filter by target ID",
        },
        {
          name: "level",
          in: "query",
          schema: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            example: "beginner",
          },
          description: "Filter by level (beginner, intermediate, advanced)",
        },
        {
          name: "category",
          in: "query",
          schema: { type: "string", example: "652ea53e4b2a0e9b3b8e12f8" },
          description: "Filter by category ID",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string", example: "programming" },
          description: "Search by card deck title or description",
        },
      ],
      responses: {
        200: {
          description: "List of card decks with pagination",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Fetch card decks successfully",
                metadata: {
                  decks: [
                    {
                      id: "652eb1af4b2a0e9b3b8e1300",
                      title: "Basic Programming Concepts",
                      level: "beginner",
                      target: "652ea43f4b2a0e9b3b8e12f7",
                      status: STATUS.ACTIVE,
                      createdAt: "2024-08-20T10:30:00.000Z",
                    },
                    {
                      id: "652eb1cf4b2a0e9b3b8e1311",
                      title: "Advanced Algorithms",
                      level: "advanced",
                      status: STATUS.ACTIVE,
                    },
                  ],
                  pagination: {
                    total: 45,
                    pageNum: 1,
                    pageSize: 10,
                    totalPages: 5,
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },

  // GET /v1/api/card-deck/{cardDeckId}
  getCardDeck: {
    get: {
      summary: "Get a card deck by ID",
      tags: ["Card Deck"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "cardDeckId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Card deck ID",
        },
      ],
      responses: {
        200: {
          description: "Card deck details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Card deck retrieved successfully",
                metadata: {
                  id: "652eb1af4b2a0e9b3b8e1300",
                  title: "Basic Programming Concepts",
                  description: "Flashcards for programming fundamentals.",
                  target: "652ea43f4b2a0e9b3b8e12f7",
                  categoryId: "652ea53e4b2a0e9b3b8e12f8",
                  level: "beginner",
                  thumbnail: "https://example.com/thumbnail.png",
                  status: STATUS.ACTIVE,
                  createdAt: "2024-08-20T10:30:00.000Z",
                  updatedAt: "2024-08-21T09:15:00.000Z",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  // PUT /v1/api/card-deck/{cardDeckId}
  updateCardDeck: {
    put: {
      summary: "Update a card deck",
      tags: ["Card Deck"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "cardDeckId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Card deck ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CardDeckRequest" },
            example: {
              title: "Basic Programming Concepts",
              description: "Flashcards for fundamental programming concepts.",
              target: "652ea43f4b2a0e9b3b8e12f7",
              level: "beginner",
              thumbnail: "https://example.com/thumbnail.png",
              status: STATUS.ACTIVE,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Card deck updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Card deck updated successfully",
                metadata: {
                  id: "652eb1af4b2a0e9b3b8e1300",
                  title: "Updated Deck Title",
                  level: "intermediate",
                  updatedAt: "2024-08-22T08:45:00.000Z",
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

  // DELETE /v1/api/card-deck/{cardDeckId}
  deleteCardDeck: {
    delete: {
      summary: "Delete a card deck (soft delete)",
      tags: ["Card Deck"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "cardDeckId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Card deck ID",
        },
      ],
      responses: {
        200: {
          description: "Card deck deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Card deck deleted successfully",
                metadata: {
                  id: "652eb1af4b2a0e9b3b8e1300",
                  status: STATUS.INACTIVE,
                  updatedAt: "2024-08-23T12:00:00.000Z",
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

  // GET /v1/api/card-deck/category/{categoryId}
  getCardDeckByCategory: {
    get: {
      summary: "Get all card decks by category ID",
      tags: ["Card Deck"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "categoryId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ID",
        },
      ],
      responses: {
        200: {
          description: "List of card decks in the specified category",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Card decks retrieved successfully",
                metadata: [
                  {
                    id: "652eb1af4b2a0e9b3b8e1300",
                    title: "JavaScript Basics",
                    category: "652ea53e4b2a0e9b3b8e12f8",
                    level: "beginner",
                  },
                  {
                    id: "652eb1cf4b2a0e9b3b8e1311",
                    title: "React Hooks",
                    level: "intermediate",
                  },
                ],
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

module.exports = cardDeckDocs;
