"use strict";

const { Router } = require("express");
const analyticsController = require("../controllers/analytics.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

// All routes require authentication
router.use(auth.authenticate);

// Overview statistics
router.get("/overview", asynchandler(analyticsController.getOverviewStats));

// User registration trend
router.get("/users/trend", asynchandler(analyticsController.getUserTrend));

// Content distribution
router.get("/content/distribution", asynchandler(analyticsController.getContentDistribution));

// Recent activity
router.get("/activity/recent", asynchandler(analyticsController.getRecentActivity));

// Quiz & Exam statistics
router.get("/assessments", asynchandler(analyticsController.getAssessmentStats));

// Learning path statistics
router.get("/learning-paths", asynchandler(analyticsController.getLearningPathStats));

module.exports = router;
