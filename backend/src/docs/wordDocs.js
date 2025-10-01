"use strict";

const { param } = require("../routes/word.route");

/**
 * Word API Documentation
 * Swagger definitions cho word endpoints
 */
const wordDocs = {
  components: {
    wordPaths: {
      create: {
        post: {
          summary: "Create a new word",
          tags: ["Word"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WordRequest",
                },
                example: {
                  word: "walk",
                  pronunciation: "/wɔːk/",
                  audio: "https://example.com/audio/walk.mp3",
                  partOfSpeech: "verb",
                  level: "beginner",
                  frequency: 10,
                  definitions: [
                    {
                      meaning: "to move from one place to another",
                      meaningVi: "di chuyển từ nơi này sang nơi khác",
                      examples: [
                        {
                          sentence: "I walk to school every day.",
                          translation: "Tôi đi bộ đến trường mỗi ngày.",
                        },
                      ],
                    },
                  ],
                  synonyms: ["stroll", "march"],
                  antonyms: ["stand", "stop"],
                  relatedWords: ["walking", "walker"],
                  categories: ["652a3f4b7d25a34c9c1a2345"],
                  tags: ["daily", "verb"],
                  image: "https://example.com/images/walk.png",
                  difficulty: 2,
                  isActive: true,
                },
              },
            },
          },
          responses: {
            201: {
              description: "Word created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/WordResponse",
                  },
                  example: {
                    message: "Word created successfully",
                    metadata: {
                      word: {
                        id: "652a3f4b7d25a34c9c1a2345",
                        word: "walk",
                        pronunciation: "/wɔːk/",
                        audio: "https://example.com/audio/walk.mp3",
                        partOfSpeech: "verb",
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            500: { $ref: "#/components/responses/InternalServerError" },
          },
        },
      },
      updateWord: {
        put: {
          summary: "Update an existing word",
          tags: ["Word"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "wordId",
              in: "path",
              required: true,
              schema: { type: "string", example: "652a3f4b7d25a34c9c1a2345" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WordRequest",
                },
                example: {
                  word: "walk",
                  pronunciation: "/wɔːk/",
                  audio: "https://example.com/audio/walk.mp3",
                  partOfSpeech: "verb",
                  level: "beginner",
                  frequency: 10,
                  definitions: [
                    {
                      meaning: "to move from one place to another",
                      meaningVi: "di chuyển từ nơi này sang nơi khác",
                      examples: [
                        {
                          sentence: "I walk to school every day.",
                          translation: "Tôi đi bộ đến trường mỗi ngày.",
                        },
                      ],
                    },
                  ],
                  synonyms: ["stroll", "march"],
                  antonyms: ["stand", "stop"],
                  relatedWords: ["walking", "walker"],
                  categories: ["652a3f4b7d25a34c9c1a2345"],
                  tags: ["daily", "verb"],
                  image: "https://example.com/images/walk.png",
                  difficulty: 2,
                  isActive: true,
                },
              },
            },
          },
          responses: {
            201: {
              description: "Word created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/WordResponse",
                  },
                  example: {
                    message: "Word created successfully",
                    metadata: {
                      word: {
                        id: "652a3f4b7d25a34c9c1a2345",
                        word: "walk",
                        pronunciation: "/wɔːk/",
                        audio: "https://example.com/audio/walk.mp3",
                        partOfSpeech: "verb",
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            500: { $ref: "#/components/responses/InternalServerError" },
          },
        },
      },

      getWordsByCategory: {
        get: {
          summary: "Get words by category (with pagination & filters)",
          tags: ["Word"],
          parameters: [
            {
              name: "categoryId",
              in: "path",
              required: true,
              schema: { type: "string", example: "652a3f4b7d25a34c9c1a2345" },
            },
            {
              name: "pageNum",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "pageSize",
              in: "query",
              schema: { type: "integer", default: 20 },
            },
            {
              name: "sort",
              in: "query",
              schema: { type: "string", example: "word" },
            },
            {
              name: "order",
              in: "query",
              schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
            },
            {
              name: "query",
              in: "query",
              schema: { type: "string" },
              description: "Search keyword",
            },
            {
              name: "level",
              in: "query",
              schema: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"],
              },
            },
            {
              name: "partOfSpeech",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "noun",
                  "verb",
                  "adjective",
                  "adverb",
                  "preposition",
                  "conjunction",
                  "interjection",
                  "pronoun",
                ],
              },
            },
            {
              name: "difficulty",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 5 },
            },
            {
              name: "isActive",
              in: "query",
              schema: { type: "boolean", default: true },
            },
          ],
          responses: {
            200: {
              description: "List of words by category",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      metadata: {
                        type: "object",
                        properties: {
                          words: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/WordResponse",
                            },
                          },
                          pagination: {
                            type: "object",
                            properties: {
                              pageNum: { type: "integer" },
                              pageSize: { type: "integer" },
                              total: { type: "integer" },
                              pages: { type: "integer" },
                              hasNext: { type: "boolean" },
                              hasPrev: { type: "boolean" },
                            },
                          },
                        },
                      },
                    },
                  },
                  example: {
                    message: "Fetched successfully",
                    metadata: {
                      words: [
                        {
                          id: "652a3f4b7d25a34c9c1a2345",
                          word: "walk",
                          pronunciation: "/wɔːk/",
                          partOfSpeech: "verb",
                          level: "beginner",
                        },
                      ],
                      pagination: {
                        pageNum: 1,
                        pageSize: 20,
                        total: 100,
                        pages: 5,
                        hasNext: true,
                        hasPrev: false,
                      },
                    },
                  },
                },
              },
            },
            404: { $ref: "#/components/responses/NotFoundError" },
            500: { $ref: "#/components/responses/InternalServerError" },
          },
        },
      },
      deleteWord: {
        delete: {
          summary: "Delete a word by ID",
          tags: ["Word"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "wordId",
              in: "path",
              required: true,
              schema: { type: "string", example: "652a3f4b7d25a34c9c1a2345" },
            },
          ],
          responses: {
            200: {
              description: "Word deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Word deleted successfully",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid word ID",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "Invalid word ID" },
                    },
                  },
                },
              },
            },
            404: {
              description: "Word not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "Word not found" },
                    },
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "Unauthorized" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      importWords: {
        post: {
          summary: "Import multiple words via CSV/Excel",
          tags: ["Word"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "CSV hoặc Excel file chứa danh sách từ vựng",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Import result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      successCount: { type: "integer" },
                      failedCount: { type: "integer" },
                      successWords: {
                        type: "array",
                        items: { type: "string" },
                      },
                      failedRecords: {
                        type: "array",
                        items: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      exportSampleWords: {
        get: {
          summary: "Export sample words as Excel file",
          tags: ["Word"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Sample Excel file",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      fileName: {
                        type: "string",
                        example: "sample_words.xlsx",
                      },
                      buffer: { type: "string", format: "binary" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = wordDocs;
