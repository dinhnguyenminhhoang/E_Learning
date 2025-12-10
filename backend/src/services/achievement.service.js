"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const HTTP_STATUS = require("../constants/httpStatus");
const AchievementRepository = require("../repositories/achievement.repo");
const UserAchievementRepository = require("../repositories/userAchievement.repo");
const User = require("../models/User");
const { toObjectId } = require("../helpers/idHelper");

class AchievementService {
    async getMyAchievements(req) {
        const userId = req.user?._id;

        try {
            const allAchievements = await AchievementRepository.getAllAchievements();

            const user = await User.findById(userId);
            const userStats = user?.statistics || {};

            // First, run checkAndUnlockAchievements to sync any pending achievements
            await this.checkAndUnlockAchievements(userId, userStats);

            // Now get updated user achievements
            const userAchievements = await UserAchievementRepository.getUserAchievements(userId);

            const userAchievementMap = new Map();
            userAchievements.forEach((ua) => {
                if (ua.achievement?._id) {
                    userAchievementMap.set(ua.achievement._id.toString(), ua);
                }
            });

            const mergedAchievements = allAchievements.map((achievement) => {
                const userAchievement = userAchievementMap.get(achievement._id.toString());

                if (userAchievement) {
                    return userAchievement;
                } else {
                    let currentValue = 0;
                    const targetValue = achievement.criteria?.target || 1;

                    switch (achievement.type) {
                        case "streak":
                            currentValue = userStats.currentStreak || 0;
                            break;
                        case "login_streak":
                            currentValue = userStats.currentLoginStreak || 0;
                            break;
                        case "words_learned":
                            currentValue = userStats.totalWordsLearned || 0;
                            break;
                        case "sessions":
                            currentValue = Math.floor((userStats.totalStudyTime || 0) / 600);
                            break;
                        default:
                            currentValue = 0;
                    }

                    const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));
                    const isCompleted = currentValue >= targetValue;

                    return {
                        _id: null,
                        user: userId,
                        achievement: achievement,
                        progress: progress,
                        currentValue: currentValue,
                        isCompleted: isCompleted,
                        unlockedAt: isCompleted ? new Date() : null,
                        createdAt: new Date(),
                    };
                }
            });

            const totalCount = mergedAchievements.length;
            const completedCount = mergedAchievements.filter((ua) => ua.isCompleted).length;
            const inProgressCount = mergedAchievements.filter(
                (ua) => !ua.isCompleted && ua.progress > 0
            ).length;

            const byRarity = {
                common: mergedAchievements.filter((ua) => ua.achievement?.rarity === "common"),
                rare: mergedAchievements.filter((ua) => ua.achievement?.rarity === "rare"),
                epic: mergedAchievements.filter((ua) => ua.achievement?.rarity === "epic"),
                legendary: mergedAchievements.filter((ua) => ua.achievement?.rarity === "legendary"),
            };

            return ResponseBuilder.success("Lấy achievements thành công.", {
                achievements: mergedAchievements,
                stats: {
                    total: totalCount,
                    completed: completedCount,
                    inProgress: inProgressCount,
                    locked: totalCount - completedCount - inProgressCount,
                },
                byRarity,
            });
        } catch (error) {
            console.error("[AchievementService] Error getting achievements:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy achievements.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }

    }

    async getAchievementDetails(req) {
        const userId = req.user?._id;
        const { achievementId } = req.params;

        try {
            const userAchievement = await UserAchievementRepository.findOrCreate(
                userId,
                achievementId
            );

            if (!userAchievement) {
                return ResponseBuilder.notFoundError("Achievement không tồn tại.");
            }

            return ResponseBuilder.success("Lấy achievement thành công.", userAchievement);
        } catch (error) {
            console.error("[AchievementService] Error getting achievement:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy achievement.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }


    async checkAndUnlockAchievements(userId, userStats) {
        try {
            console.log(`[Achievement] checkAndUnlockAchievements called for user ${userId}`);
            const unlockedAchievements = [];

            const allAchievements = await AchievementRepository.getAllAchievements();
            console.log(`[Achievement] Found ${allAchievements.length} total achievements to check`);

            for (const achievement of allAchievements) {
                try {
                    const userAchievement = await UserAchievementRepository.findOrCreate(
                        userId,
                        achievement._id
                    );

                    // Skip if findOrCreate failed or already completed
                    if (!userAchievement) {
                        console.log(`[Achievement] Skipping ${achievement.name} - findOrCreate returned null`);
                        continue;
                    }

                    if (userAchievement.isCompleted) {
                        continue;
                    }

                    let currentValue = 0;
                    let shouldUnlock = false;

                    switch (achievement.type) {
                        case "streak":
                            currentValue = userStats.currentStreak || 0;
                            break;

                        case "login_streak":
                            currentValue = userStats.currentLoginStreak || 0;
                            break;

                        case "words_learned":
                            currentValue = userStats.totalWordsLearned || 0;
                            break;

                        case "quiz_score":
                            continue;

                        case "sessions":
                            currentValue = Math.floor((userStats.totalStudyTime || 0) / 600);
                            break;

                        default:
                            continue;
                    }

                    const targetValue = achievement.criteria?.target || 1;
                    const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));

                    if (currentValue >= targetValue) {
                        shouldUnlock = true;
                        console.log(`[Achievement] SHOULD UNLOCK "${achievement.name}": ${currentValue} >= ${targetValue}`);
                    }

                    if (shouldUnlock) {
                        const unlocked = await UserAchievementRepository.unlockAchievement(
                            userId,
                            achievement._id
                        );

                        if (unlocked) {
                            unlockedAchievements.push(unlocked);

                            if (achievement.points > 0) {
                                console.log(`[Achievement] Awarding ${achievement.points} XP for "${achievement.name}"`);
                                await this._awardPoints(userId, achievement.points);
                            }
                        }
                    } else if (progress !== userAchievement.progress && progress > 0) {
                        await UserAchievementRepository.updateProgress(
                            userId,
                            achievement._id,
                            progress
                        );
                    }
                } catch (innerError) {
                    console.error(`[Achievement] Error processing ${achievement.name}:`, innerError.message);
                }
            }

            console.log(`[Achievement] Unlocked ${unlockedAchievements.length} achievements for user ${userId}`);
            return unlockedAchievements;
        } catch (error) {
            console.error("[AchievementService] Error checking achievements:", error);
            return [];
        }
    }

    async checkQuizAchievements(userId, quizData) {
        try {
            console.log(`[Achievement] checkQuizAchievements called for user ${userId}, score: ${quizData.percentage}%`);
            const unlockedAchievements = [];

            const quizAchievements = await AchievementRepository.getAchievementsByType("quiz_score");

            for (const achievement of quizAchievements) {
                try {
                    const userAchievement = await UserAchievementRepository.findOrCreate(
                        userId,
                        achievement._id
                    );

                    if (!userAchievement) {
                        console.log(`[Achievement] Skipping ${achievement.name} - findOrCreate returned null`);
                        continue;
                    }

                    if (userAchievement.isCompleted) continue;

                    const criteriaTarget = achievement.criteria?.target || 100;

                    if (quizData.percentage >= criteriaTarget) {
                        console.log(`[Achievement] SHOULD UNLOCK "${achievement.name}": ${quizData.percentage}% >= ${criteriaTarget}%`);

                        const unlocked = await UserAchievementRepository.unlockAchievement(
                            userId,
                            achievement._id
                        );

                        if (unlocked) {
                            unlockedAchievements.push(unlocked);

                            if (achievement.points > 0) {
                                console.log(`[Achievement] Awarding ${achievement.points} XP for "${achievement.name}"`);
                                await this._awardPoints(userId, achievement.points);
                            }
                        }
                    }
                } catch (innerError) {
                    console.error(`[Achievement] Error processing quiz achievement ${achievement.name}:`, innerError.message);
                }
            }

            console.log(`[Achievement] Unlocked ${unlockedAchievements.length} quiz achievements for user ${userId}`);
            return unlockedAchievements;
        } catch (error) {
            console.error("[AchievementService] Error checking quiz achievements:", error);
            return [];
        }
    }


    async _awardPoints(userId, points) {
        console.log(`[Achievement] _awardPoints called - userId: ${userId}, points: ${points}`);
        try {
            const result = await User.findByIdAndUpdate(
                userId,
                {
                    $inc: {
                        'statistics.totalXP': points,
                        'statistics.weeklyXP': points,
                        'statistics.monthlyXP': points,
                    },
                    $set: {
                        'statistics.lastXPUpdate': new Date(),
                    }
                },
                { new: true }
            );

            if (result) {
                console.log(`[Achievement] SUCCESS - Awarded ${points} XP to user ${userId}. New totalXP: ${result.statistics?.totalXP}`);
            } else {
                console.error(`[Achievement] FAILED - user ${userId} not found`);
            }
        } catch (error) {
            console.error("[AchievementService] Error awarding points:", error);
        }
    }
    async getAllAchievements(req) {
        const {
            page = 1,
            limit = 20,
            type,
            rarity,
            status,
        } = req.query || {};

        const skip = (parseInt(page) - 1) * parseInt(limit);

        try {
            const [achievements, total] = await Promise.all([
                AchievementRepository.getAllAchievements({
                    type,
                    rarity,
                    status,
                    skip,
                    limit: parseInt(limit),
                }),
                AchievementRepository.countAchievements({ type, rarity, status }),
            ]);

            return ResponseBuilder.successWithPagination(
                "Lấy danh sách achievements thành công.",
                achievements,
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                }
            );
        } catch (error) {
            console.error("[AchievementService] Error getting all achievements:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy achievements.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async createAchievement(req) {
        const data = req.body;

        try {
            const achievement = await AchievementRepository.createAchievement({
                ...data,
                updatedBy: req.user?.id || null,
                updatedAt: new Date(),
            });

            return ResponseBuilder.success(
                "Tạo achievement thành công.",
                achievement,
                HTTP_STATUS.CREATED
            );
        } catch (error) {
            console.error("[AchievementService] Error creating achievement:", error);
            return ResponseBuilder.error(
                "Lỗi khi tạo achievement.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateAchievement(req) {
        const { achievementId } = req.params;
        const updateData = req.body;

        try {
            const achievement = await AchievementRepository.updateAchievement(achievementId, {
                ...updateData,
                updatedBy: req.user?.id || null,
                updatedAt: new Date(),
            });

            if (!achievement) {
                return ResponseBuilder.notFoundError("Achievement không tồn tại.");
            }

            return ResponseBuilder.success("Cập nhật achievement thành công.", achievement);
        } catch (error) {
            console.error("[AchievementService] Error updating achievement:", error);
            return ResponseBuilder.error(
                "Lỗi khi cập nhật achievement.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async deleteAchievement(req) {
        const { achievementId } = req.params;

        try {
            const achievement = await AchievementRepository.updateAchievement(achievementId, {
                deleted: true,
                deletedAt: new Date(),
                deletedBy: req.user?.id || null,
            });

            if (!achievement) {
                return ResponseBuilder.notFoundError("Achievement không tồn tại.");
            }

            return ResponseBuilder.success("Xóa achievement thành công.", { achievementId });
        } catch (error) {
            console.error("[AchievementService] Error deleting achievement:", error);
            return ResponseBuilder.error(
                "Lỗi khi xóa achievement.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

module.exports = new AchievementService();
