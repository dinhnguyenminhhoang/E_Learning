const { Router } = require("express");
const userBlockProgressController = require("../controllers/userBlockProgress.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.post(
  "/lessons/:lessonId/blocks/initialize",
  auth.authenticate,
  asynchandler(userBlockProgressController.initializeBlockProgress)
);

router.get(
  "/lessons/:lessonId/blocks/progress",
  auth.authenticate,
  asynchandler(userBlockProgressController.getLessonBlocksProgress)
);

router.get(
  "/blocks/:blockId/progress",
  auth.authenticate,
  asynchandler(userBlockProgressController.getBlockProgress)
);

router.post(
  "/blocks/:blockId/start",
  auth.authenticate,
  asynchandler(userBlockProgressController.startBlock)
);

router.post(
  "/blocks/:blockId/complete",
  auth.authenticate,
  asynchandler(userBlockProgressController.completeBlock)
);

module.exports = router;
