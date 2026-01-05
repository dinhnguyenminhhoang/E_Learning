"use strict";

const { Router } = require("express");
const UserOnboardingAnswerController = require("../controllers/userOnboardingAnswer.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");
const {
  validateSubmitAnswers,
} = require("../middlewares/onboarding.middleware");

const router = Router();

router.post(
  "/",
  auth.authenticate,
  validateSubmitAnswers,
  asynchandler(UserOnboardingAnswerController.save)
);

module.exports = router;
