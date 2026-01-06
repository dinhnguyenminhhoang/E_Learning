const { Router } = require("express");
const blockController = require("../controllers/block.controller");
const { authenticate } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

const router = Router();

router.get("/:blockId", authenticate, asynchandler(blockController.getBlockById));
router.get("/:blockId/with-progress", authenticate, asynchandler(blockController.getBlockWithProgress));
router.post("/:blockId/start", authenticate, asynchandler(blockController.startLearningBlock));
router.post("/:blockId/video-heartbeat", authenticate, asynchandler(blockController.heartbeat));
router.post("/:blockId/vocabulary-complete", authenticate, asynchandler(blockController.markVocabularyComplete));
router.post("/ai-generate", authenticate, asynchandler(blockController.aiGenerateBlockContent));

module.exports = router;
