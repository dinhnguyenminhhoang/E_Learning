"use strict";

const express = require("express");
const router = express.Router();

const AchievementController = require("../controllers/achievement.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const { asynchandler } = require("../helpers/asyncHandler");

router.get(
    "/my",
    authenticate,
    asynchandler(AchievementController.getMyAchievements)
);

router.get(
    "/:achievementId",
    authenticate,
    asynchandler(AchievementController.getAchievementDetails)
);

router.get(
    "/admin/list",
    authenticate,
    authorize(["ADMIN"]),
    asynchandler(AchievementController.getAllAchievements)
);

router.post(
    "/admin",
    authenticate,
    authorize(["ADMIN"]),
    asynchandler(AchievementController.createAchievement)
);

router.put(
    "/admin/:achievementId",
    authenticate,
    authorize(["ADMIN"]),
    asynchandler(AchievementController.updateAchievement)
);

router.delete(
    "/admin/:achievementId",
    authenticate,
    authorize(["ADMIN"]),
    asynchandler(AchievementController.deleteAchievement)
);

module.exports = router;