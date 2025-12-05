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
router.use(`/v1/api/lesson`, require("./lesson.route"));
router.use(`/v1/api/quiz`, require("./quiz.route"));
router.use(`/v1/api/exam`, require("./exam.route"));
router.use(`/v1/api/user-learning-path`, require("./userLearningPath.route"));
router.use(`/v1/api/target`, require("./target.route"));
router.use(`/v1/api/block`, require("./block.route"));
router.use(`/v1/api/user-progress`, require("./userProgress.route"));
router.use(`/v1/api/users/me`, require("./userBlockProgress.route"));
router.use(`/v1/api`, require("./quizAttemptForBlock.route"));

module.exports = router;
