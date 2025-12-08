const { Router } = require("express");
const blockController = require("../controllers/block.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

const router = Router();

/**
 * GET /v1/api/block/:blockId
 * Lấy block by ID với format response giống request khi tạo (cho admin)
 * Note: Route này phải đặt trước /:blockId/with-progress để tránh conflict
 */
router.get(
  "/:blockId",
  authenticate,
  asynchandler(blockController.getBlockById)
);

/**
 * GET /v1/api/block/:blockId/with-progress
 * Lấy block kèm progress của user (để resume video)
 */
router.get(
  "/:blockId/with-progress",
  authenticate,
  asynchandler(blockController.getBlockWithProgress)
);

/**
 * POST /v1/api/block/:blockId/start
 * Bắt đầu học một block - thêm block vào user progress với trạng thái chưa hoàn thành
 * Query params: ?learningPathId=xxx (optional)
 */
router.post(
  "/:blockId/start",
  authenticate,
  asynchandler(blockController.startLearningBlock)
);

/**
 * POST /v1/api/block/:blockId/video-heartbeat
 * Track video heartbeat - cập nhật progress khi user xem video
 */
router.post(
  "/:blockId/video-heartbeat",
  authenticate,
  asynchandler(blockController.heartbeat)
);

module.exports = router;
