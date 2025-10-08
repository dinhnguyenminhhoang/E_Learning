"use strict";

const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const onboardingController = require("../controllers/onboarding.controller");

const router = Router();

router.get(
  "/",
  asynchandler(onboardingController.getQuestions)
);

module.exports = router;
