"use strict";

const LeaderboardService = require("../services/leaderboard.service");
const ResponseBuilder = require("../types/response/baseResponse");

class LeaderboardController {
    async getLeaderboard(req, res) {
        try {
            const { period = "allTime", limit = 100, offset = 0 } = req.query;

            const result = await LeaderboardService.getLeaderboard({
                period,
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            res.status(result.code).json(result);
        } catch (error) {
            console.error("Get leaderboard error:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getMyRank(req, res) {
        try {
            const { period = "allTime" } = req.query;
            const userId = req.user._id;

            const result = await LeaderboardService.getUserRank(userId, period);

            res.status(result.code).json(result);
        } catch (error) {
            console.error("Get user rank error:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async resetPeriodicXP(req, res) {
        try {
            const { period } = req.body;

            if (!["weekly", "monthly"].includes(period)) {
                return res
                    .status(400)
                    .json(ResponseBuilder.badRequest("Invalid period"));
            }

            const result = await LeaderboardService.resetPeriodicXP(period);

            res.status(result.code).json(result);
        } catch (error) {
            console.error("Reset XP error:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }
}

module.exports = new LeaderboardController();
