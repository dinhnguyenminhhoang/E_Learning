"use strict";

const { Router } = require("express");
const UserLearningPath = require("../controllers/userLearningPath.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.get(
  "/overview",
  auth.authenticate,
  asynchandler(UserLearningPath.getUserOverview)
);

router.get(
  "/",
  auth.authenticate,
  asynchandler(UserLearningPath.getPathByUser)
);

router.post(
  "/add",
  auth.authenticate,
  asynchandler(UserLearningPath.addLearningPath)
);

router.patch(
  "/switch/:learningPathId",
  auth.authenticate,
  asynchandler(UserLearningPath.switchPath)
);

router.get("/all", auth.authenticate, asynchandler(UserLearningPath.getAllPaths));

module.exports = router;
