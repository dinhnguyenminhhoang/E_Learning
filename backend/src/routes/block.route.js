const { Router } = require("express");
const blockController = require("../controllers/block.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

const router = Router();

router.get(
  "/:blockId/with-progress",
  authenticate,
  asynchandler(blockController.getBlockWithProgress)
);

router.post(
  "/:blockId/video-heartbeat",
  authenticate,
  asynchandler(blockController.heartbeat)
);

module.exports = router;
