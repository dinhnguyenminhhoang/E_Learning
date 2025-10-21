"use strict";

const lessonDocs = {
  // =====================================
  // 📚 1. Lấy danh sách tất cả Lessons (với filter + pagination)
  // =====================================
  getAllLessons: {
    get: {
      tags: ["Lesson"],
      summary: "Lấy danh sách tất cả bài học (Lesson)",
      description:
        "Trả về danh sách bài học theo bộ lọc (filter) gồm kỹ năng, cấp độ, danh mục, từ khóa tìm kiếm và hỗ trợ phân trang.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "pageNum",
          in: "query",
          required: false,
          schema: { type: "integer", example: 1 },
          description: "Trang hiện tại (mặc định = 1)",
        },
        {
          name: "pageSize",
          in: "query",
          required: false,
          schema: { type: "integer", example: 10 },
          description: "Số lượng bản ghi mỗi trang (mặc định = 10)",
        },
        {
          name: "skill",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["listening", "speaking", "reading", "writing"],
          },
          description: "Lọc theo kỹ năng (Skill)",
        },
        {
          name: "level",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
          },
          description: "Lọc theo cấp độ (Level)",
        },
        {
          name: "categoryId",
          in: "query",
          required: false,
          schema: { type: "string", example: "6701b8f7d123a15bcd987654" },
          description: "Lọc theo ID của danh mục (Category)",
        },
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string", example: "grammar" },
          description: "Tìm kiếm theo tiêu đề hoặc chủ đề bài học",
        },
      ],
      responses: {
        200: {
          description: "Fetched all lessons successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: {
                  success: true,
                  message: "Fetched all lessons successfully",
                  pagination: {
                    total: 42,
                    pageNum: 1,
                    pageSize: 10,
                    totalPages: 5,
                  },
                  data: {
                    total: 42,
                    pageNum: 1,
                    pageSize: 10,
                    totalPages: 5,
                    lessons: [
                      {
                        _id: "6710b9f9123a15bcd987654",
                        title: "Basic English Grammar",
                        description: "Learn fundamental English grammar rules.",
                        skill: "reading",
                        topic: "grammar",
                        level: "beginner",
                        duration_minutes: 30,
                        order: 1,
                        categoryId: {
                          _id: "6701b8f7d123a15bcd987654",
                          name: "Grammar Basics",
                        },
                        createdAt: "2025-10-21T03:45:10.000Z",
                        updatedAt: "2025-10-21T03:45:10.000Z",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        400: { description: "Invalid query parameters" },
        401: { description: "Unauthorized (missing or invalid token)" },
        500: { description: "Internal server error" },
      },
    },
  },
};

module.exports = lessonDocs;
