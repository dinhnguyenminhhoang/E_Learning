"use strict";

const { Router } = require("express");
const UserOnboardingAnswerController = require("../controllers/userOnboardingAnswer.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.post(
  "/",
//   auth.authenticate,
  asynchandler(UserOnboardingAnswerController.save)
);

module.exports = router;
