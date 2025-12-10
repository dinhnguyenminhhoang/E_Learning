"use strict";

const UserAchievement = require("../models/UserAchievement");
const { toObjectId } = require("../helpers/idHelper");

class UserAchievementRepository {
    async getUserAchievements(userId) {
        return await UserAchievement.find({ user: toObjectId(userId) })
            .populate("achievement")
            .sort({ isCompleted: -1, "achievement.rarity": -1, createdAt: -1 })
            .lean();
    }

    async getUserAchievement(userId, achievementId) {
        return await UserAchievement.findOne({
            user: toObjectId(userId),
            achievement: toObjectId(achievementId),
        })
            .populate("achievement")
            .lean();
    }

    async createUserAchievement(data) {
        const userAchievement = new UserAchievement(data);
        return await userAchievement.save();
    }

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
            { new: true, upsert: true }
        )
            .populate("achievement")
            .lean();
    }

    async unlockAchievement(userId, achievementId) {
        try {
            const result = await UserAchievement.findOneAndUpdate(
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
                    $setOnInsert: {
                        user: toObjectId(userId),
                        achievement: toObjectId(achievementId),
                    }
                },
                { new: true, upsert: true }
            )
                .populate("achievement")
                .lean();

            console.log(`[UserAchievement] Unlocked ${achievementId} for user ${userId}: ${result ? 'SUCCESS' : 'FAILED'}`);
            return result;
        } catch (error) {
            if (error.code === 11000) {
                console.log(`[UserAchievement] Duplicate key on unlock, fetching existing record`);
                return await this.getUserAchievement(userId, achievementId);
            }
            throw error;
        }
    }

    async getCompletedCount(userId) {
        return await UserAchievement.countDocuments({
            user: toObjectId(userId),
            isCompleted: true,
        });
    }

    async getInProgressCount(userId) {
        return await UserAchievement.countDocuments({
            user: toObjectId(userId),
            isCompleted: false,
            progress: { $gt: 0 },
        });
    }

    async initializeUserAchievements(userId, achievements) {
        const userAchievements = achievements.map((achievementId) => ({
            user: toObjectId(userId),
            achievement: toObjectId(achievementId),
            progress: 0,
            isCompleted: false,
        }));

        return await UserAchievement.insertMany(userAchievements, { ordered: false }).catch(() => []);
    }

    async findOrCreate(userId, achievementId) {
        try {
            const result = await UserAchievement.findOneAndUpdate(
                {
                    user: toObjectId(userId),
                    achievement: toObjectId(achievementId),
                },
                {
                    $setOnInsert: {
                        user: toObjectId(userId),
                        achievement: toObjectId(achievementId),
                        progress: 0,
                        isCompleted: false,
                    }
                },
                { new: true, upsert: true }
            )
                .populate("achievement")
                .lean();

            return result;
        } catch (error) {
            if (error.code === 11000) {
                console.log(`[UserAchievement] Duplicate key in findOrCreate, fetching existing`);
                const existing = await this.getUserAchievement(userId, achievementId);
                return existing;
            }
            console.error(`[UserAchievement] Error in findOrCreate:`, error);
            return null;
        }
    }

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
