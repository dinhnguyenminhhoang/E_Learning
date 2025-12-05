"use strict";

const { model, Schema } = require("mongoose");
const { STATUS } = require("../constants/status.constans");
const { toObjectId } = require("../helpers/idHelper");

const DOCUMENT_NAME = "UserProgress";
const COLLECTION_NAME = "UserProgresses";

const userProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    learningPath: {
      type: Schema.Types.ObjectId,
      ref: "LearningPath",
      required: true,
      index: true,
    },

    // levelOrder: {
    //   type: Number, // thứ tự level trong lộ trình
    //   required: true,
    //   min: 1,
    //   index: true,
    // },

    // lessonOrder: {
    //   type: Number, // thứ tự bài học (hoặc quiz) trong level
    //   required: true,
    //   min: 1,
    //   index: true,
    // },

    lessonLeaned: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
        required: true,
        index: true,
      },
    ],

    // Nested structure để lưu chi tiết progress theo lesson và block
    lessonProgress: [
      {
        lessonId: {
          type: Schema.Types.ObjectId,
          ref: "Lesson",
          required: true,
          index: true,
        },
        // Progress chi tiết của từng block trong lesson
        blockProgress: [
          {
            blockId: {
              type: Schema.Types.ObjectId,
              ref: "ContentBlock",
              required: true,
            },
            // Thời gian đã xem nhiều nhất (để resume)
            maxWatchedTime: {
              type: Number,
              default: 0, // seconds
              min: 0,
            },
            // Tổng thời lượng video (lưu lần đầu nhận được)
            videoDuration: {
              type: Number,
              default: 0, // seconds
              min: 0,
            },
            // Đã hoàn thành >= 85% chưa
            isCompleted: {
              type: Boolean,
              default: false,
            },
            // Thời điểm hoàn thành block
            completedAt: {
              type: Date,
              default: null,
            },
            // Lần cuối cập nhật progress
            lastUpdatedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        // Lesson đã hoàn thành chưa (tự động tính từ block progress)
        isCompleted: {
          type: Boolean,
          default: false,
        },
        // Thời điểm hoàn thành lesson
        completedAt: {
          type: Date,
          default: null,
        },
        // Lần cuối truy cập lesson
        lastAccessedAt: {
          type: Date,
          default: Date.now,
        },
        // Block user đang xem (có thể là block cũ đã completed - để học lại)
        lastAccessedBlockId: {
          type: Schema.Types.ObjectId,
          ref: "ContentBlock",
          default: null,
        },
      },
    ],

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "review"],
      default: "not_started",
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    attempts: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },

    timeSpent: {
      type: Number,
      default: 0, // tổng thời gian học (giây hoặc phút)
    },

    updatedAt: {
      type: Date,
      default: null,
      index: true,
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
    minimize: false,
    versionKey: false,
  }
);

// ===== INDEXES =====
userProgressSchema.index(
  { user: 1, learningPath: 1, levelOrder: 1, lessonOrder: 1 },
  { unique: true }
);

// ===== VIRTUALS =====
userProgressSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// ===== METHODS =====
userProgressSchema.methods.markCompleted = function (score = 100) {
  this.status = "completed";
  this.score = score;
  this.completedAt = new Date();
  return this.save();
};

// Method để update block progress trong lesson
userProgressSchema.methods.updateBlockProgress = function (
  lessonId,
  blockId,
  maxWatchedTime,
  videoDuration
) {
  const COMPLETION_RATE = 0.85; // 85%

  // Tìm hoặc tạo lesson progress
  let lessonProgress = this.lessonProgress.find(
    (lp) => lp.lessonId.toString() === lessonId.toString()
  );

  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      blockProgress: [],
      isCompleted: false,
      lastAccessedAt: new Date(),
    };
    this.lessonProgress.push(lessonProgress);
  }

  // Tìm hoặc tạo block progress
  let blockProgress = lessonProgress.blockProgress.find(
    (bp) => bp.blockId.toString() === blockId.toString()
  );

  if (!blockProgress) {
    blockProgress = {
      blockId,
      maxWatchedTime: 0,
      videoDuration: 0,
      isCompleted: false,
      lastUpdatedAt: new Date(),
    };
    lessonProgress.blockProgress.push(blockProgress);
  }

  // Cập nhật maxWatchedTime (chỉ tăng, không giảm)
  // Đảm bảo không vượt quá videoDuration
  const validMaxWatchedTime = Math.min(
    Math.max(blockProgress.maxWatchedTime, maxWatchedTime),
    videoDuration > 0 ? videoDuration : Infinity
  );
  blockProgress.maxWatchedTime = validMaxWatchedTime;

  // Lưu videoDuration nếu chưa có hoặc cập nhật nếu thay đổi
  if (videoDuration > 0) {
    blockProgress.videoDuration = videoDuration;
  }

  // Kiểm tra hoàn thành block (>= 85%)
  if (
    !blockProgress.isCompleted &&
    blockProgress.videoDuration > 0 &&
    blockProgress.maxWatchedTime / blockProgress.videoDuration >=
      COMPLETION_RATE
  ) {
    blockProgress.isCompleted = true;
    blockProgress.completedAt = new Date();
  }

  blockProgress.lastUpdatedAt = new Date();
  lessonProgress.lastAccessedAt = new Date();
  // Cập nhật lastAccessedBlockId khi user học block này
  lessonProgress.lastAccessedBlockId = blockId;

  // Tự động tính lesson completion (tất cả block đã completed)
  // Lấy danh sách block từ lesson để so sánh
  // Note: Cần populate lesson để lấy blocks, hoặc truyền từ ngoài vào
  // Tạm thời để logic này ở service layer

  return this;
};

// Method để cập nhật lastAccessedBlockId (khi user chọn xem một block)
userProgressSchema.methods.updateLastAccessedBlock = function (
  lessonId,
  blockId
) {
  let lessonProgress = this.lessonProgress.find(
    (lp) => lp.lessonId.toString() === lessonId.toString()
  );

  if (!lessonProgress) {
    // Tạo lesson progress mới nếu chưa có
    lessonProgress = {
      lessonId: toObjectId(lessonId),
      blockProgress: [],
      isCompleted: false,
      lastAccessedAt: new Date(),
      lastAccessedBlockId: toObjectId(blockId),
    };
    this.lessonProgress.push(lessonProgress);
  } else {
    lessonProgress.lastAccessedBlockId = toObjectId(blockId);
    lessonProgress.lastAccessedAt = new Date();
  }

  return this;
};

// Method để lấy block progress
userProgressSchema.methods.getBlockProgress = function (lessonId, blockId) {
  const lessonProgress = this.lessonProgress.find(
    (lp) => lp.lessonId.toString() === lessonId.toString()
  );

  if (!lessonProgress) {
    return null;
  }

  const blockProgress = lessonProgress.blockProgress.find(
    (bp) => bp.blockId.toString() === blockId.toString()
  );

  return blockProgress || null;
};

// Method để lấy lesson progress
userProgressSchema.methods.getLessonProgress = function (lessonId) {
  return (
    this.lessonProgress.find(
      (lp) => lp.lessonId.toString() === lessonId.toString()
    ) || null
  );
};

// ===== STATICS =====
userProgressSchema.statics.findByUserAndPath = function (userId, pathId) {
  return this.find({ user: userId, learningPath: pathId, updatedAt: null });
};

// ===== MIDDLEWARES =====
// Soft delete
userProgressSchema.pre(["deleteOne", "deleteMany"], function () {
  this.updateOne({}, { updatedAt: new Date(), status: "not_started" });
});

// Query middleware để loại bỏ deleted records
userProgressSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "count", "countDocuments"],
  function () {
    if (!("status" in this.getQuery())) {
      this.where({ status: { $ne: STATUS.DELETED } });
    }
  }
);

module.exports = model(DOCUMENT_NAME, userProgressSchema);
