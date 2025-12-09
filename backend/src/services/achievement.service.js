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

            const userAchievements = await UserAchievementRepository.getUserAchievements(userId);

            const user = await User.findById(userId);
            const userStats = user?.statistics || {};

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

                    return {
                        _id: null,
                        user: userId,
                        achievement: achievement,
                        progress: progress,
                        currentValue: currentValue,
                        isCompleted: false,
                        unlockedAt: null,
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
            const unlockedAchievements = [];

            const allAchievements = await AchievementRepository.getAllAchievements();

            for (const achievement of allAchievements) {
                const userAchievement = await UserAchievementRepository.findOrCreate(
                    userId,
                    achievement._id
                );

                // Skip if already completed
                if (userAchievement.isCompleted) continue;

                let currentValue = 0;
                let shouldUnlock = false;

                // Check based on achievement type
                switch (achievement.type) {
                    case "streak":
                        currentValue = userStats.currentStreak || 0;
                        break;

                    case "login_streak":
                        currentValue = userStats.currentLoginStreak || 0;
                        console.log(`[Achievement] login_streak check - currentLoginStreak: ${currentValue}, target: ${achievement.criteria?.target}`);
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
                    console.log(`[Achievement] Should unlock ${achievement.name}: currentValue=${currentValue} >= targetValue=${targetValue}`);
                }

                // Update progress
                if (shouldUnlock && !userAchievement.isCompleted) {
                    const unlocked = await UserAchievementRepository.unlockAchievement(
                        userId,
                        achievement._id
                    );

                    if (unlocked) {
                        unlockedAchievements.push(unlocked);

                        // Award points to user (if points system exists)
                        if (achievement.points > 0) {
                            await this._awardPoints(userId, achievement.points);
                        }
                    }
                } else if (progress !== userAchievement.progress) {
                    await UserAchievementRepository.updateProgress(
                        userId,
                        achievement._id,
                        progress
                    );
                }
            }

            return unlockedAchievements;
        } catch (error) {
            console.error("[AchievementService] Error checking achievements:", error);
            return [];
        }
    }

    async checkQuizAchievements(userId, quizData) {
        try {
            const unlockedAchievements = [];

            // Get quiz-type achievements
            const quizAchievements = await AchievementRepository.getAchievementsByType("quiz_score");

            for (const achievement of quizAchievements) {
                const userAchievement = await UserAchievementRepository.findOrCreate(
                    userId,
                    achievement._id
                );

                if (userAchievement.isCompleted) continue;

                // Check criteria (example: "perfect_score" = 100%, "high_score" = 90%+)
                const criteriaTarget = achievement.criteria?.target || 100;

                if (quizData.percentage >= criteriaTarget) {
                    const unlocked = await UserAchievementRepository.unlockAchievement(
                        userId,
                        achievement._id
                    );

                    if (unlocked) {
                        unlockedAchievements.push(unlocked);

                        if (achievement.points > 0) {
                            await this._awardPoints(userId, achievement.points);
                        }
                    }
                }
            }

            return unlockedAchievements;
        } catch (error) {
            console.error("[AchievementService] Error checking quiz achievements:", error);
            return [];
        }
    }


    async _awardPoints(userId, points) {
        try {
            // TODO: Implement points system in User model if needed
            console.log(`[Achievement] Awarded ${points} points to user ${userId}`);
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
