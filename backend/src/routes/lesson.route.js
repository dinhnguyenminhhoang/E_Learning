const { Router } = require("express");
const lessonController = require("../controllers/lesson.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const { validateCreateLesson } = require("../middlewares/lesson");
const {
  validateCreateBlock,
  validateUpdateBlock,
  validateAssignBlock,
} = require("../middlewares/block.middleware");

const router = Router();
router.post(
  "/attach-quiz",
  auth.authenticate,
  asynchandler(lessonController.attachQuizToLesson)
);
router.post(
  "/detach-quiz",
  auth.authenticate,
  asynchandler(lessonController.detachQuizFromLesson)
);
router.get(
  "/",
  auth.authenticate,
  asynchandler(lessonController.getAllLessons)
);

router.get(
  "/blocks/all",
  auth.authenticate,
  asynchandler(lessonController.getAllBlocks)
);

router.post(
  "/",
  auth.authenticate,
  validateCreateLesson,
  asynchandler(lessonController.createLesson)
);

router.get(
  "/:lessonId/edit",
  auth.authenticate,
  asynchandler(lessonController.getDetailForEdit)
);

router.get(
  "/:lessonId/user/:userId",
  auth.authenticate,
  asynchandler(lessonController.getLessonById)
);
router.delete(
  "/:lessonId",
  auth.authenticate,
  asynchandler(lessonController.deleteLesson)
);
router.put(
  "/:lessonId",
  auth.authenticate,
  validateCreateLesson,
  asynchandler(lessonController.updateLesson)
);

router.post(
  "/:lessonId/blocks",
  auth.authenticate,
  validateAssignBlock,
  asynchandler(lessonController.assignBlockToLesson)
);

router.get(
  "/blocks/:blockId",
  auth.authenticate,
  asynchandler(lessonController.getBlockById)
);

router.post(
  "/blocks",
  auth.authenticate,
  validateCreateBlock,
  asynchandler(lessonController.createBlock)
);

router.put(
  "/blocks/:blockId",
  auth.authenticate,
  validateUpdateBlock,
  asynchandler(lessonController.updateBlock)
);

router.delete(
  "/blocks/:blockId",
  auth.authenticate,
  asynchandler(lessonController.deleteBlock)
);

module.exports = router;
