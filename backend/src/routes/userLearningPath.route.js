"use strict";

const { Router } = require("express");
const UserLearningPath = require("../controllers/userLearningPath.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.get(
  "/",
  auth.authenticate,
  asynchandler(UserLearningPath.getPathByUser)
);

module.exports = router;
