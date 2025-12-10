"use strict";

const { Router } = require("express");
const { asynchandler } = require("../helpers/asyncHandler");
const { authenticate } = require("../middlewares/auth");
const profileService = require("../services/profile.service");

const router = Router();

router.get("/me", authenticate, asynchandler(async (req, res) => {
    const result = await profileService.getMyProfile(req);
    return res.status(result.code).json(result);
}));

router.put("/me", authenticate, asynchandler(async (req, res) => {
    const result = await profileService.updateMyProfile(req);
    return res.status(result.code).json(result);
}));

router.get("/stats", authenticate, asynchandler(async (req, res) => {
    const result = await profileService.getWeeklyStats(req);
    return res.status(result.code).json(result);
}));

router.put("/avatar", authenticate, asynchandler(async (req, res) => {
    const result = await profileService.updateAvatar(req);
    return res.status(result.code).json(result);
}));

module.exports = router;
