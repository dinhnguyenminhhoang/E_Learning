"use strict";

const { Router } = require("express");
const leaderboardController = require("../controllers/leaderboard.controller");
const { asynchandler } = require("../helpers/asyncHandler");
const auth = require("../middlewares/auth");

const router = Router();

router.get(
    "/",
    auth.authenticate,
    asynchandler(leaderboardController.getLeaderboard)
);

router.get(
    "/me",
    auth.authenticate,
    asynchandler(leaderboardController.getMyRank)
);

router.post(
    "/reset",
    auth.authenticate,
    auth.authorize("ADMIN"),
    asynchandler(leaderboardController.resetPeriodicXP)
);

module.exports = router;
