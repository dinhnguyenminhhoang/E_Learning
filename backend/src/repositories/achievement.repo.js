"use strict";

const Achievement = require("../models/Achievement");
const { toObjectId } = require("../helpers/idHelper");

class AchievementRepository {
    /**
     * Get all active achievements
     * @param {Object} options - Query options
     * @returns {Promise<Array>}
     */
    async getAllAchievements(options = {}) {
        const {
            type,
            rarity,
            status,
            sort = { createdAt: -1 },
            skip = 0,
            limit = 100,
        } = options;

        const filter = { deleted: { $ne: true } };
        if (type) filter.type = type;
        if (rarity) filter.rarity = rarity;
        if (status) filter.status = status;

        return await Achievement.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    /**
     * Count achievements
     * @param {Object} filter - Filter criteria
     * @returns {Promise<number>}
     */
    async countAchievements(filter = {}) {
        return await Achievement.countDocuments(filter);
    }

    /**
     * Get achievement by ID
     * @param {string} achievementId
     * @returns {Promise<Object|null>}
     */
    async getAchievementById(achievementId) {
        return await Achievement.findById(toObjectId(achievementId)).lean();
    }

    /**
     * Get achievements by type
     * @param {string} type - Achievement type
     * @returns {Promise<Array>}
     */
    async getAchievementsByType(type) {
        return await Achievement.find({ type }).sort({ "criteria.target": 1 }).lean();
    }

    /**
     * Create new achievement
     * @param {Object} data - Achievement data
     * @returns {Promise<Object>}
     */
    async createAchievement(data) {
        const achievement = new Achievement(data);
        return await achievement.save();
    }

    /**
     * Update achievement
     * @param {string} achievementId
     * @param {Object} updateData
     * @returns {Promise<Object|null>}
     */
    async updateAchievement(achievementId, updateData) {
        return await Achievement.findByIdAndUpdate(
            toObjectId(achievementId),
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();
    }

    /**
     * Soft delete achievement
     * @param {string} achievementId
     * @returns {Promise<Object|null>}
     */
    async deleteAchievement(achievementId) {
        return await Achievement.findByIdAndUpdate(
            toObjectId(achievementId),
            { $set: { updatedAt: new Date() } },
            { new: true }
        ).lean();
    }

    /**
     * Find achievements by criteria unit
     * @param {string} unit - Criteria unit (e.g., "days", "words", "points")
     * @returns {Promise<Array>}
     */
    async findByUnit(unit) {
        return await Achievement.find({ "criteria.unit": unit })
            .sort({ "criteria.target": 1 })
            .lean();
    }
}

module.exports = new AchievementRepository();
