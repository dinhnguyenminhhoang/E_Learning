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
  createLesson: {
    post: {
      tags: ["Lesson"],
      summary: "Tạo mới bài học (Lesson)",
      description: "Tạo mới một bài học với các thông tin chi tiết.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "skill", "topic", "level", "categoryId"],
              properties: {
                title: {
                  type: "string",
                  example: "Basic English Grammar",
                  description: "Tiêu đề bài học (bắt buộc, tối đa 255 ký tự)",
                },
                description: {
                  type: "string",
                  example: "Learn the fundamentals of English grammar.",
                  description: "Mô tả chi tiết về bài học (tùy chọn)",
                },
                skill: {
                  type: "string",
                  enum: ["listening", "speaking", "reading", "writing"],
                  example: "reading",
                  description: "Kỹ năng chính của bài học (bắt buộc)",
                },
                topic: {
                  type: "string",
                  example: "grammar",
                  description:
                    "Chủ đề của bài học (bắt buộc, tối đa 100 ký tự)",
                },
                level: {
                  type: "string",
                  enum: ["beginner", "intermediate", "advanced"],
                  example: "beginner",
                  description: "Cấp độ bài học (bắt buộc)",
                },
                duration_minutes: {
                  type: "integer",
                  example: 30,
                  description:
                    "Thời lượng bài học (phút), mặc định là 30, tối thiểu 1",
                },
                order: {
                  type: "integer",
                  example: 1,
                  description: "Thứ tự sắp xếp của bài học (mặc định = 0)",
                },
                categoryId: {
                  type: "string",
                  example: "6701b8f7d123a15bcd987654",
                  description:
                    "ID của danh mục chứa bài học (MongoDB ObjectId)",
                },
                prerequisites: {
                  type: "array",
                  items: {
                    type: "string",
                    example: "6701b8f7d123a15bcd987653",
                  },
                  description:
                    "Danh sách ID của các bài học tiên quyết (nếu có)",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Lesson created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: {
                  success: true,
                  message: "Lesson created successfully",
                  data: {
                    _id: "6710baab123a15bcd987654",
                    title: "Basic English Grammar",
                    description: "Learn the fundamentals of English grammar.",
                    skill: "reading",
                    topic: "grammar",
                    level: "beginner",
                    duration_minutes: 30,
                    order: 1,
                    categoryId: "6701b8f7d123a15bcd987654",
                    prerequisites: [],
                    createdAt: "2025-10-23T04:45:10.000Z",
                    updatedAt: "2025-10-23T04:45:10.000Z",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation failed (invalid or missing fields)",
        },
        401: { description: "Unauthorized (missing or invalid token)" },
        500: { description: "Internal server error" },
      },
    },
  },
  getLesson: {
    get: {
      tags: ["Lesson"],
      security: [{ bearerAuth: [] }],
      summary: "Lấy thông tin chi tiết bài học theo ID và người dùng",
      description:
        "Trả về thông tin chi tiết của bài học cùng trạng thái đã hoàn thành hay chưa của người dùng.",
      parameters: [
        {
          in: "path",
          name: "lessonId",
          required: true,
          schema: { type: "string", example: "6718b6cd12" },
          description: "ID của bài học cần lấy",
        },
        {
          in: "path",
          name: "userId",
          required: true,
          schema: { type: "string", example: "6718b5f478" },
          description: "ID của người dùng",
        },
      ],
      responses: {
        200: {
          description: "Lấy chi tiết bài học thành công",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Fetched lesson successfully",
                data: {
                  isLessonCompleted: false,
                  _id: "6718b6cd12",
                  title: "Cơ bản về ReactJS",
                  categoryId: "6718b5a47c",
                  level: "Intermediate",
                  order: 2,
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy bài học hoặc người dùng",
        },
      },
    },
  },

  updateLesson: {
    put: {
      tags: ["Lesson"],
      summary: "Cập nhật thông tin bài học",
      security: [{ bearerAuth: [] }],

      description:
        "Cập nhật nội dung, tiêu đề, hoặc trạng thái của một bài học. Cho phép chỉnh sửa các trường như tiêu đề, mô tả, kỹ năng, cấp độ, thời lượng, thumbnail, thứ tự, danh mục, trạng thái, hoặc danh sách block.",
      parameters: [
        {
          in: "path",
          name: "lessonId",
          required: true,
          schema: { type: "string", example: "6718b6cd12" },
          description: "ID của bài học cần cập nhật",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "Cập nhật bài học ReactJS" },
                description: {
                  type: "string",
                  example:
                    "Phiên bản cập nhật với phần React Hooks và Context API.",
                },
                skill: {
                  type: "string",
                  enum: ["listening", "speaking", "reading", "writing"],
                  example: "reading",
                  description: "Kỹ năng mà bài học hướng đến.",
                },
                topic: {
                  type: "string",
                  example: "ReactJS Basics",
                  description: "Chủ đề của bài học.",
                },
                level: {
                  type: "string",
                  enum: ["beginner", "intermediate", "advanced"],
                  example: "advanced",
                  description: "Trình độ của bài học.",
                },
                duration_minutes: {
                  type: "number",
                  minimum: 1,
                  example: 50,
                  description: "Thời lượng của bài học (phút).",
                },
                order: {
                  type: "number",
                  example: 2,
                  description: "Thứ tự xuất hiện của bài học trong danh mục.",
                },
                thumbnail: {
                  type: "string",
                  example:
                    "https://cdn.example.com/thumbnails/react-hooks-update.png",
                },
                prerequisites: {
                  type: "array",
                  items: { type: "string", example: "6718b6cd12" },
                  description: "Danh sách ID các bài học tiên quyết.",
                },
                status: {
                  type: "string",
                  enum: ["ACTIVE", "PENDING", "DELETED"],
                  example: "ACTIVE",
                },
                categoryId: {
                  type: "string",
                  example: "6718b5a47c",
                  description: "ID danh mục mà bài học thuộc về.",
                },
                blocks: {
                  type: "array",
                  description:
                    "Danh sách các khối nội dung và bài tập của bài học.",
                  items: {
                    type: "object",
                    properties: {
                      block: {
                        type: "string",
                        example: "6719a3b57e",
                        description: "ID của ContentBlock liên kết.",
                      },
                      exercise: {
                        type: "string",
                        example: "6719a3d49c",
                        description: "ID của Quiz bài tập (nếu có).",
                      },
                      order: {
                        type: "number",
                        example: 1,
                        description:
                          "Thứ tự xuất hiện của block trong bài học.",
                      },
                    },
                  },
                },
              },
            },
            example: {
              title: "Cập nhật bài học ReactJS",
              description: "Thêm phần về React Hooks.",
              skill: "reading",
              topic: "ReactJS",
              level: "advanced",
              duration_minutes: 50,
              order: 3,
              thumbnail: "https://cdn.example.com/react-update.png",
              prerequisites: ["6718b2f123"],
              categoryId: "6718b5a47c",
              status: "ACTIVE",
              blocks: [
                {
                  block: "6719a3b57e",
                  exercise: "6719a3d49c",
                  order: 1,
                },
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Cập nhật bài học thành công",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Updated lesson successfully",
                data: {
                  _id: "6718b6cd12",
                  title: "Cập nhật bài học ReactJS",
                  skill: "reading",
                  level: "advanced",
                  status: "ACTIVE",
                },
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy bài học cần cập nhật",
          content: {
            "application/json": {
              example: {
                success: false,
                message: "Lesson not found.",
              },
            },
          },
        },
        409: {
          description: "Tiêu đề bài học đã tồn tại",
          content: {
            "application/json": {
              example: {
                success: false,
                message: "Lesson title already exists.",
              },
            },
          },
        },
      },
    },
  },

  deleteLesson: {
    delete: {
      tags: ["Lesson"],
      summary: "Xóa mềm bài học theo ID",
      security: [{ bearerAuth: [] }],
      description:
        "Xóa bài học khỏi danh sách hiển thị (soft delete), không xóa khỏi cơ sở dữ liệu.",
      parameters: [
        {
          in: "path",
          name: "lessonId",
          required: true,
          schema: { type: "string", example: "6718b6cd12" },
          description: "ID của bài học cần xóa",
        },
      ],
      responses: {
        200: {
          description: "Xóa bài học thành công",
          content: {
            "application/json": {
              example: {
                success: true,
                message: "Deleted lesson successfully",
              },
            },
          },
        },
        404: {
          description: "Không tìm thấy bài học cần xóa",
        },
      },
    },
  },
};

module.exports = lessonDocs;
