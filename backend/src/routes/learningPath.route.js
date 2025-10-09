"use strict";

const express = require("express");
const router = express.Router();
const LearningPathController = require("../controllers/learningPath.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

router.post(
  "/",
  auth.authenticate,
  asynchandler(LearningPathController.createNewPath)
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

module.exports = router;
