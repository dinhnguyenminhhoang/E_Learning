const { Router } = require("express");
const lessonController = require("../controllers/lesson.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const { validateCreateLesson } = require("../middlewares/lesson");

const router = Router();
router.get(
  "/",
  auth.authenticate,
  asynchandler(lessonController.getAllLessons)
);
router.post(
  "/",
  auth.authenticate,
  validateCreateLesson,
  asynchandler(lessonController.createLesson)
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
  asynchandler(lessonController.updateLesson)
);
module.exports = router;
