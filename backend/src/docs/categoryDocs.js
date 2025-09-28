"use strict";

const categoryDocs = {
  // POST /v1/api/category
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
              name: "Programming",
              nameVi: "Lập trình",
              slug: "programming",
              description: "All programming related content",
              icon: "https://example.com/icon.png",
              color: "#FF5733",
              level: "beginner",
              parentCategory: null,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Category created successfully",
          contennt: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category created successfully",
                metadata: {
                  id: "60f8c1f8f8f8f8f8f8f8f8f8",
                  name: "Programming",
                  nameVi: "Lập trình",
                  slug: "programming",
                  level: "beginner",
                  status: "active",
                },
              },
            },
          },
        },
      },
      400: { $ref: "#/components/responses/ValidationError" },
      401: { $ref: "#/components/responses/UnauthorizedError" },
    },
  },

  // GET /v1/api/category
  listCategories: {
    get: {
      summary: "Get all categories",
      tags: ["Category"],
      security: [],
      parameters: [],
      responses: {
        200: {
          description: "List of categories",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Categories retrieved successfully",
                metadata: [
                  {
                    id: "60f8c1f8f8f8f8f8f8f8f8f8",
                    name: "Programming",
                    nameVi: "Lập trình",
                    slug: "programming",
                    level: "beginner",
                    status: "active",
                    wordCount: 120,
                  },
                  {
                    id: "60f8c1f8f8f8f8f8f8f8f9f9",
                    name: "Design",
                    nameVi: "Thiết kế",
                    slug: "design",
                    level: "intermediate",
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

  // GET /v1/api/category/{id}
  getCategoryById: {
    get: {
      summary: "Get category by ID",
      tags: ["Category"],
      security: [],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ID",
        },
      ],
      responses: {
        200: {
          description: "Category details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category retrieved successfully",
                metadata: {
                  id: "60f8c1f8f8f8f8f8f8f8f8f8",
                  name: "Programming",
                  nameVi: "Lập trình",
                  slug: "programming",
                  description: "All programming related content",
                  icon: "https://example.com/icon.png",
                  color: "#FF5733",
                  level: "beginner",
                  parentCategory: null,
                  status: "active",
                  wordCount: 120,
                  createdAt: "2024-08-16T10:30:00.000Z",
                  updatedAt: "2024-08-17T09:15:00.000Z",
                },
              },
            },
          },
        },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  // PUT /v1/api/category/{id}
  updateCategory: {
    put: {
      summary: "Update a category",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
            example: {
              name: "Programming Updated",
              nameVi: "Lập trình nâng cao",
              slug: "programming-updated",
              description: "Updated description",
              color: "#00FF00",
              status: "active",
            },
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
                  id: "60f8c1f8f8f8f8f8f8f8f8f8",
                  name: "Programming Updated",
                  nameVi: "Lập trình nâng cao",
                  slug: "programming-updated",
                  color: "#00FF00",
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

  // DELETE /v1/api/category/{id}
  deleteCategory: {
    delete: {
      summary: "Soft delete a category",
      tags: ["Category"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Category ID",
        },
      ],
      responses: {
        200: {
          description: "Category deleted successfully (soft delete)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
              example: {
                message: "Category deleted successfully",
                metadata: {
                  id: "60f8c1f8f8f8f8f8f8f8f8f8",
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
module.exports = categoryDocs;
