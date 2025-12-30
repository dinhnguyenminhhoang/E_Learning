"use strict";

const { Router } = require("express");
const analyticsController = require("../controllers/analytics.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.use(auth.authenticate);

router.get("/overview", asynchandler(analyticsController.getOverviewStats));
router.get("/users/trend", asynchandler(analyticsController.getUserTrend));
router.get("/content/distribution", asynchandler(analyticsController.getContentDistribution));
router.get("/activity/recent", asynchandler(analyticsController.getRecentActivity));
router.get("/assessments", asynchandler(analyticsController.getAssessmentStats));
router.get("/learning-paths", asynchandler(analyticsController.getLearningPathStats));

module.exports = router;
