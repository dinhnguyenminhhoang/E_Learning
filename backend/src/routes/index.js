"use strict";
const express = require("express");
const router = express.Router();

router.use(`/v1/api/user`, require("./auth.route"));
router.use(`/v1/api/word`, require("./word.route"));
router.use(`/v1/api/category`, require("./category.route"));
router.use(`/v1/api/flashcard`, require("./flashCard.route"));
router.use(`/v1/api/card-deck`, require("./cardDeck.route"));
router.use(`/v1/api/learning-path`, require("./learningPath.route"));
router.use(`/v1/api/onboarding`, require("./onboarding.route"));
router.use(`/v1/api/userOnboardingAnswer`, require("./onboardingAnswer.route"));
module.exports = router;
