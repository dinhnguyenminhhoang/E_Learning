"use strict";

const learningPathDocs = {
  // =====================================
  // 🧩 1. Tạo mới Learning Path
  // =====================================
  createNewPath: {
    post: {
      tags: ["Learning Path"],
      summary: "Tạo mới Learning Path",
      description: "Tạo một Learning Path mới theo target đã tồn tại.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                targetId: {
                  type: "string",
                  example: "6701b8f7d123a15bcd987654",
                },
                title: {
                  type: "string",
                  example: "English Vocabulary Path A1",
                },
                description: {
                  type: "string",
                  example: "Lộ trình học từ vựng cho người mới bắt đầu.",
                },
              },
              required: ["targetId", "title"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Learning path created successfully",
        },
        400: { description: "Bad request" },
        404: { description: "Target not found" },
        409: { description: "Learning path already exists" },
      },
    },
  },

  // =====================================
  // 📚 2. Lấy danh sách tất cả Learning Path
  // =====================================
  getAllPath: {
    get: {
      tags: ["Learning Path"],
      summary: "Lấy danh sách tất cả Learning Path",
      description: "Trả về toàn bộ các Learning Path đang hoạt động.",
      responses: {
        200: {
          description: "Fetch successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: {
                  success: true,
                  message: "Fetch successfully",
                  data: [
                    {
                      _id: "6701c9f9123a15bcd987654",
                      title: "English Vocabulary Path A1",
                      description:
                        "Lộ trình học từ vựng tiếng Anh cho người mới bắt đầu.",
                      status: "ACTIVE",
                      target: "66ffdd987a1234abcd567890",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },

  // =====================================
  // 🧱 3. Gán Lesson vào Learning Path
  // =====================================
  assignLessonToPath: {
    post: {
      tags: ["Learning Path"],
      summary: "Gán Lesson vào Level và Module trong Learning Path",
      description:
        "Thêm hoặc cập nhật bài học (Lesson) thuộc về một Level và Module cụ thể trong Learning Path.",
      parameters: [
        {
          name: "learningPathId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID của Learning Path cần gán lesson",
          example: "6701b8f7d123a15bcd987654",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                titleLevel: {
                  type: "string",
                  example: "Level 1",
                },
                categoryParentId: {
                  type: "string",
                  example: "6701b9a7e123a15bcd999001",
                },
                categoryChildId: {
                  type: "string",
                  example: "6701b9a7e123a15bcd999002",
                },
                cardDeckId: {
                  type: "string",
                  example: "6701b9a7e123a15bcd999003",
                },
              },
              required: [
                "titleLevel",
                "categoryParentId",
                "categoryChildId",
                "cardDeckId",
              ],
            },
          },
        },
      },
      responses: {
        200: { description: "Lesson added successfully" },
        400: { description: "Invalid input" },
        404: {
          description: "Learning path, level, or card deck not found",
        },
      },
    },
  },

  // =====================================
  // 🌳 4. Lấy cấu trúc Learning Path (Level/Module/Lesson)
  // =====================================
  getHierarchy: {
    get: {
      tags: ["Learning Path"],
      summary: "Lấy cấu trúc Learning Path (Level / Module / Lesson)",
      description:
        "Lấy các cấp độ (levels), modules (categories cha), hoặc lessons (categories con) của Learning Path tùy theo query truyền vào.",
      parameters: [
        {
          name: "learningPathId",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "ID của Learning Path cần truy vấn",
          example: "6701b8f7d123a15bcd987654",
        },
        {
          name: "isLevel",
          in: "query",
          required: false,
          schema: { type: "boolean" },
          example: true,
          description: "Nếu true → trả về toàn bộ levels trong Learning Path.",
        },
        {
          name: "isModule",
          in: "query",
          required: false,
          schema: { type: "boolean" },
          example: true,
          description:
            "Nếu true → lấy danh sách module (category cha) trong Level cụ thể (cần truyền levelOrder).",
        },
        {
          name: "isLesson",
          in: "query",
          required: false,
          schema: { type: "boolean" },
          example: true,
          description:
            "Nếu true → lấy danh sách lesson (category con) của module cụ thể (cần truyền moduleId).",
        },
        {
          name: "levelOrder",
          in: "query",
          required: false,
          schema: { type: "integer" },
          example: 1,
          description: "Thứ tự level cần lấy module (nếu isModule = true).",
        },
        {
          name: "moduleId",
          in: "query",
          required: false,
          schema: { type: "string" },
          example: "6701b9a7e123a15bcd999001",
          description: "ID module cần lấy lessons (nếu isLesson = true).",
        },
      ],
      responses: {
        200: {
          description:
            "Fetched levels/modules/lessons successfully (tùy query).",
        },
        400: { description: "Invalid query parameters" },
        404: { description: "Learning Path not found" },
      },
    },
  },
  // =====================================
  // 🧱 5. Thêm Level mới vào Learning Path
  // =====================================
  createNewLevel: {
    post: {
      tags: ["Learning Path"],
      summary: "Thêm Level mới vào Learning Path",
      description:
        "Thêm một level mới vào cuối danh sách level của Learning Path. Mỗi level mới sẽ tự động có `order` = `số lượng level hiện có + 1`.",
      parameters: [
        {
          name: "learningPathId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ID của Learning Path cần thêm level",
          example: "68e61c5d5e75582d4ed5ef4d",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  example: "Level 1 - Grammar Basics",
                  description: "Tên của level mới cần thêm.",
                },
              },
              required: ["title"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Level added successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: {
                  status: "success",
                  message: "Level added successfully",
                  data: {
                    _id: "68e61c5d5e75582d4ed5ef4d",
                    title: "English Vocabulary Path A1",
                    levels: [
                      {
                        order: 1,
                        title: "Level 1 - Grammar Basics",
                        categories: [],
                      },
                    ],
                    updatedAt: "2025-10-08T07:00:00.000Z",
                  },
                  code: 200,
                  timestamp: "2025-10-08T07:00:01.000Z",
                },
              },
            },
          },
        },
        400: { description: "Invalid input data" },
        404: { description: "Learning Path not found" },
        500: { description: "Internal server error" },
      },
    },
  },
};

module.exports = learningPathDocs;
