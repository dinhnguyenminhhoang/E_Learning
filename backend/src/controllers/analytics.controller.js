"use strict";

const AnalyticsService = require("../services/analytics.service");
const ResponseBuilder = require("../types/response/baseResponse");

class AnalyticsController {
    async getOverviewStats(req, res) {
        try {
            const result = await AnalyticsService.getOverviewStats();
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting overview stats:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getUserTrend(req, res) {
        try {
            const { period } = req.query;
            const result = await AnalyticsService.getUserTrend(period);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting user trend:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getContentDistribution(req, res) {
        try {
            const result = await AnalyticsService.getContentDistribution();
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting content distribution:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getRecentActivity(req, res) {
        try {
            const { limit } = req.query;
            const result = await AnalyticsService.getRecentActivity(limit);
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting recent activity:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getAssessmentStats(req, res) {
        try {
            const result = await AnalyticsService.getAssessmentStats();
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting assessment stats:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }

    async getLearningPathStats(req, res) {
        try {
            const result = await AnalyticsService.getLearningPathStats();
            res.status(result.code).json(result);
        } catch (error) {
            console.error("Error getting learning path stats:", error);
            res.status(500).json(ResponseBuilder.error("Internal server error", 500));
        }
    }
}

module.exports = new AnalyticsController();
