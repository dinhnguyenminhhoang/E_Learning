"use strict";

/**
 * Category API Documentation
 */

const categoryDocs = {
  createCategory: {
    post: {
      summary: "Create a new category",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
            example: {
              name: "Business",
              description: "Business related vocabulary",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Category created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category created successfully!",
                metadata: {
                  id: "651f1f77bcf86cd799439021",
                  name: "Business",
                  description: "Business related vocabulary",
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
      },
    },
  },

  listCategories: {
    get: {
      summary: "List all categories",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Categories fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
              example: {
                message: "Categories fetched successfully",
                metadata: {
                  items: [
                    {
                      id: "651f1f77bcf86cd799439021",
                      name: "Business",
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

  getCategory: {
    get: {
      summary: "Get category by ID",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Category fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category retrieved successfully",
                metadata: {
                  id: "651f1f77bcf86cd799439021",
                  name: "Business",
                  description: "Business related vocabulary",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  updateCategory: {
    put: {
      summary: "Update category",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
            example: { name: "Business Advanced" },
          },
        },
      },
      responses: {
        200: {
          description: "Category updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category updated successfully",
                metadata: {
                  id: "651f1f77bcf86cd799439021",
                  name: "Business Advanced",
                },
              },
            },
          },
        },
      },
    },
  },

  deleteCategory: {
    delete: {
      summary: "Delete category",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Category deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category deleted successfully",
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

module.exports = categoryDocs;
