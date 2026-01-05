const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const { authenticate } = require("../middlewares/auth");
const userProgressController = require("../controllers/userProgress.controller");
const {
  validateCompleteBlock,
} = require("../middlewares/userProgress.middleware");

const router = Router();

router.get(
  "/lessons/:lessonId",
  authenticate,
  asynchandler(userProgressController.getUserProgress)
);

router.put(
  "/lessons/:lessonId/blocks/:blockId/access",
  authenticate,
  validateCompleteBlock,
  asynchandler(userProgressController.markBlockAsAccessing)
);

module.exports = router;
