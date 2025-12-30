"use strict";

const achievementService = require("../services/achievement.service");

class AchievementController {
    async getMyAchievements(req, res) {
        const result = await achievementService.getMyAchievements(req);
        return res.status(result.code).json(result);
    }

    async getAchievementDetails(req, res) {
        const result = await achievementService.getAchievementDetails(req);
        return res.status(result.code).json(result);
    }

    async getAllAchievements(req, res) {
        const result = await achievementService.getAllAchievements(req);
        return res.status(result.code).json(result);
    }

    async createAchievement(req, res) {
        const result = await achievementService.createAchievement(req);
        return res.status(result.code).json(result);
    }

    async updateAchievement(req, res) {
        const result = await achievementService.updateAchievement(req);
        return res.status(result.code).json(result);
    }

    async deleteAchievement(req, res) {
        const result = await achievementService.deleteAchievement(req);
        return res.status(result.code).json(result);
    }
}

module.exports = new AchievementController();
