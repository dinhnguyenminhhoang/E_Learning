const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const { authenticate } = require("../middlewares/auth");
const userProgressController = require("../controllers/userProgress.controller");

const router = Router();

/**
 * GET /v1/api/user-progress/lessons/:lessonId
 * Lấy danh sách các block đã hoàn thành trong lesson
 */
router.get(
  "/lessons/:lessonId",
  authenticate,
  asynchandler(userProgressController.getUserProgress)
);

/**
 * PUT /v1/api/user-progress/lessons/:lessonId/blocks/:blockId/access
 * Đánh dấu block là "đang xem" (cập nhật lastAccessedBlockId)
 * Query params: ?learningPathId=xxx (optional)
 */
router.put(
  "/lessons/:lessonId/blocks/:blockId/access",
  authenticate,
  asynchandler(userProgressController.markBlockAsAccessing)
);

module.exports = router;