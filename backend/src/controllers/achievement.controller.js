"use strict";

const achievementService = require("../services/achievement.service");

class AchievementController {
    // ===== USER ENDPOINTS =====

    /**
     * Get current user's achievements with progress
     * GET /v1/api/achievements/my
     */
    async getMyAchievements(req, res) {
        const result = await achievementService.getMyAchievements(req);
        return res.status(result.code).json(result);
    }

    /**
     * Get specific achievement details
     * GET /v1/api/achievements/:achievementId
     */
    async getAchievementDetails(req, res) {
        const result = await achievementService.getAchievementDetails(req);
        return res.status(result.code).json(result);
    }

    // ===== ADMIN ENDPOINTS =====

    /**
     * Get all achievements (admin)
     * GET /v1/api/achievements/admin
     */
    async getAllAchievements(req, res) {
        const result = await achievementService.getAllAchievements(req);
        return res.status(result.code).json(result);
    }

    /**
     * Create new achievement (admin)
     * POST /v1/api/achievements/admin
     */
    async createAchievement(req, res) {
        const result = await achievementService.createAchievement(req);
        return res.status(result.code).json(result);
    }

    /**
     * Update achievement (admin)
     * PUT /v1/api/achievements/admin/:achievementId
     */
    async updateAchievement(req, res) {
        const result = await achievementService.updateAchievement(req);
        return res.status(result.code).json(result);
    }

    /**
     * Delete achievement (admin)
     * DELETE /v1/api/achievements/admin/:achievementId
     */
    async deleteAchievement(req, res) {
        const result = await achievementService.deleteAchievement(req);
        return res.status(result.code).json(result);
    }
}

module.exports = new AchievementController();
