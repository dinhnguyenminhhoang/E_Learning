"use strict";

const UserAchievement = require("../models/UserAchievement");
const { toObjectId } = require("../helpers/idHelper");

class UserAchievementRepository {
    /**
     * Get all achievements for a user with populated achievement details
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getUserAchievements(userId) {
        return await UserAchievement.find({ user: toObjectId(userId) })
            .populate("achievement")
            .sort({ isCompleted: -1, "achievement.rarity": -1, createdAt: -1 })
            .lean();
    }

    /**
     * Get specific user achievement
     * @param {string} userId
     * @param {string} achievementId
     * @returns {Promise<Object|null>}
     */
    async getUserAchievement(userId, achievementId) {
        return await UserAchievement.findOne({
            user: toObjectId(userId),
            achievement: toObjectId(achievementId),
        })
            .populate("achievement")
            .lean();
    }

    /**
     * Create or initialize user achievement
     * @param {Object} data - { user, achievement, progress, isCompleted }
     * @returns {Promise<Object>}
     */
    async createUserAchievement(data) {
        const userAchievement = new UserAchievement(data);
        return await userAchievement.save();
    }

    /**
     * Update achievement progress
     * @param {string} userId
     * @param {string} achievementId
     * @param {number} progress - Progress percentage (0-100)
     * @returns {Promise<Object|null>}
     */
    async updateProgress(userId, achievementId, progress) {
        return await UserAchievement.findOneAndUpdate(
            {
                user: toObjectId(userId),
                achievement: toObjectId(achievementId),
            },
            {
                $set: {
                    progress: Math.min(100, Math.max(0, progress)),
                },
            },
            { new: true, upsert: false }
        )
            .populate("achievement")
            .lean();
    }

    /**
     * Unlock/complete an achievement
     * @param {string} userId
     * @param {string} achievementId
     * @returns {Promise<Object|null>}
     */
    async unlockAchievement(userId, achievementId) {
        return await UserAchievement.findOneAndUpdate(
            {
                user: toObjectId(userId),
                achievement: toObjectId(achievementId),
            },
            {
                $set: {
                    progress: 100,
                    isCompleted: true,
                    unlockedAt: new Date(),
                },
            },
            { new: true, upsert: false }
        )
            .populate("achievement")
            .lean();
    }

    /**
     * Get count of completed achievements for a user
     * @param {string} userId
     * @returns {Promise<number>}
     */
    async getCompletedCount(userId) {
        return await UserAchievement.countDocuments({
            user: toObjectId(userId),
            isCompleted: true,
        });
    }

    /**
     * Get count of achievements in progress
     * @param {string} userId
     * @returns {Promise<number>}
     */
    async getInProgressCount(userId) {
        return await UserAchievement.countDocuments({
            user: toObjectId(userId),
            isCompleted: false,
            progress: { $gt: 0 },
        });
    }

    /**
     * Initialize all achievements for a new user
     * @param {string} userId
     * @param {Array} achievements - Array of achievement IDs
     * @returns {Promise<Array>}
     */
    async initializeUserAchievements(userId, achievements) {
        const userAchievements = achievements.map((achievementId) => ({
            user: toObjectId(userId),
            achievement: toObjectId(achievementId),
            progress: 0,
            isCompleted: false,
        }));

        return await UserAchievement.insertMany(userAchievements);
    }

    /**
     * Find or create user achievement
     * @param {string} userId
     * @param {string} achievementId
     * @returns {Promise<Object>}
     */
    async findOrCreate(userId, achievementId) {
        let userAchievement = await this.getUserAchievement(userId, achievementId);

        if (!userAchievement) {
            userAchievement = await this.createUserAchievement({
                user: toObjectId(userId),
                achievement: toObjectId(achievementId),
                progress: 0,
                isCompleted: false,
            });

            // Populate after creation
            userAchievement = await UserAchievement.findById(userAchievement._id)
                .populate("achievement")
                .lean();
        }

        return userAchievement;
    }

    /**
     * Get recently unlocked achievements
     * @param {string} userId
     * @param {number} limit
     * @returns {Promise<Array>}
     */
    async getRecentlyUnlocked(userId, limit = 5) {
        return await UserAchievement.find({
            user: toObjectId(userId),
            isCompleted: true,
        })
            .populate("achievement")
            .sort({ unlockedAt: -1 })
            .limit(limit)
            .lean();
    }
}

module.exports = new UserAchievementRepository();
