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

module.exports = router;
