"use strict";

const express = require("express");
const router = express.Router();
const LearningPathController = require("../controllers/learningPath.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const {
  validateAssignTargetToPath,
} = require("../middlewares/learningPath");

router.post(
  "/",
  auth.authenticate,
  asynchandler(LearningPathController.createNewPath)
);

router.post(
  "/attach-quiz",
  auth.authenticate,
  asynchandler(LearningPathController.attachQuizToLevel)
);

router.put(
  "/update-quiz-in-level",
  auth.authenticate,
  asynchandler(LearningPathController.updateQuizInLevel)
);

router.delete(
  "/remove-quiz-from-level",
  auth.authenticate,
  asynchandler(LearningPathController.removeQuizFromLevel)
);

router.post(
  "/:learningPathId/assign",
  asynchandler(LearningPathController.assignLessonToPath)
);
router.post(
  "/level/:learningPathId",
  auth.authenticate,
  asynchandler(LearningPathController.createNewLevel)
);

router.get(
  "/",
  auth.authenticate,
  asynchandler(LearningPathController.getAllPath)
);

router.get(
  "/hierarchy",
  auth.authenticate,
  asynchandler(LearningPathController.getLearningPathHierarchy)
);

router.put(
  "/:learningPathId/target",
  auth.authenticate,
  validateAssignTargetToPath,
  asynchandler(LearningPathController.assignTargetToPath)
);

module.exports = router;
