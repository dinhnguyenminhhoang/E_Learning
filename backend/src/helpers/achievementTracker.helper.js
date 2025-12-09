"use strict";

const AchievementService = require("../services/achievement.service");
const User = require("../models/User");

class AchievementTrackerHelper {
    async trackWordLearned(userId) {
        try {
            // Increment totalWordsLearned in user statistics
            const user = await User.findByIdAndUpdate(
                userId,
                { $inc: { "statistics.totalWordsLearned": 1 } },
                { new: true }
            );

            if (user && user.statistics) {
                // Check and unlock achievements
                await AchievementService.checkAndUnlockAchievements(userId, user.statistics);
            }

            console.log(`[AchievementTracker] Tracked word learned for user ${userId}`);
        } catch (error) {
            console.error("[AchievementTracker] Error tracking word:", error);
        }
    }

    async trackLessonCompletion(userId, timeSpent = 600) {
        try {
            // Update total study time (sessions are calculated from this)
            const user = await User.findByIdAndUpdate(
                userId,
                { $inc: { "statistics.totalStudyTime": timeSpent } },
                { new: true }
            );

            if (user && user.statistics) {
                // Check and unlock achievements (sessions-based)
                await AchievementService.checkAndUnlockAchievements(userId, user.statistics);
            }

            console.log(`[AchievementTracker] Tracked lesson completion for user ${userId}`);
        } catch (error) {
            console.error("[AchievementTracker] Error tracking lesson:", error);
        }
    }

    async trackDailyStreak(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            const now = new Date();
            const lastStudy = user.statistics?.lastStudyDate;

            if (!lastStudy) {
                // First time studying
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    "statistics.currentStreak": 1,
                    "statistics.longestStreak": 1,
                    "statistics.lastStudyDate": now,
                }, { new: true });

                console.log(`[AchievementTracker] Started streak for user ${userId}`);

                if (updatedUser && updatedUser.statistics) {
                    await AchievementService.checkAndUnlockAchievements(
                        userId,
                        updatedUser.statistics
                    );
                }
                return;
            }

            // Calculate days difference
            const lastStudyDate = new Date(lastStudy);
            const daysDiff = Math.floor((now - lastStudyDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day - no update needed
                return;
            } else if (daysDiff === 1) {
                // Consecutive day - increment streak
                const newStreak = (user.statistics.currentStreak || 0) + 1;
                const longestStreak = Math.max(
                    newStreak,
                    user.statistics.longestStreak || 0
                );

                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    {
                        "statistics.currentStreak": newStreak,
                        "statistics.longestStreak": longestStreak,
                        "statistics.lastStudyDate": now,
                    },
                    { new: true }
                );

                if (updatedUser && updatedUser.statistics) {
                    // Check and unlock streak achievements
                    await AchievementService.checkAndUnlockAchievements(
                        userId,
                        updatedUser.statistics
                    );
                }

                console.log(`[AchievementTracker] Updated streak to ${newStreak} for user ${userId}`);
            } else {
                // Streak broken - reset to 1
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    "statistics.currentStreak": 1,
                    "statistics.lastStudyDate": now,
                }, { new: true });

                console.log(`[AchievementTracker] Streak broken for user ${userId}, reset to 1`);

                if (updatedUser && updatedUser.statistics) {
                    await AchievementService.checkAndUnlockAchievements(
                        userId,
                        updatedUser.statistics
                    );
                }
            }
        } catch (error) {
            console.error("[AchievementTracker] Error tracking streak:", error);
        }
    }
    async trackLoginStreak(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            const now = new Date();
            const lastLogin = user.statistics?.lastLoginDate;

            if (!lastLogin) {
                // First time login tracking
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    "statistics.currentLoginStreak": 1,
                    "statistics.longestLoginStreak": 1,
                    "statistics.lastLoginDate": now,
                }, { new: true });

                console.log(`[AchievementTracker] Started login streak for user ${userId}`);

                if (updatedUser && updatedUser.statistics) {
                    await AchievementService.checkAndUnlockAchievements(
                        userId,
                        updatedUser.statistics
                    );
                }
                return;
            }

            // Calculate days difference
            const lastLoginDate = new Date(lastLogin);
            const daysDiff = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 0) {
                // Same day - no update needed
                return;
            } else if (daysDiff === 1) {
                // Consecutive day - increment login streak
                const newStreak = (user.statistics.currentLoginStreak || 0) + 1;
                const longestLoginStreak = Math.max(
                    newStreak,
                    user.statistics.longestLoginStreak || 0
                );

                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    {
                        "statistics.currentLoginStreak": newStreak,
                        "statistics.longestLoginStreak": longestLoginStreak,
                        "statistics.lastLoginDate": now,
                    },
                    { new: true }
                );

                if (updatedUser && updatedUser.statistics) {
                    // Check and unlock login_streak achievements
                    await AchievementService.checkAndUnlockAchievements(
                        userId,
                        updatedUser.statistics
                    );
                }

                console.log(`[AchievementTracker] Updated login streak to ${newStreak} for user ${userId}`);
            } else {
                // Streak broken - reset to 1
                await User.findByIdAndUpdate(userId, {
                    "statistics.currentLoginStreak": 1,
                    "statistics.lastLoginDate": now,
                });

                console.log(`[AchievementTracker] Login streak broken for user ${userId}, reset to 1`);
            }
        } catch (error) {
            console.error("[AchievementTracker] Error tracking login streak:", error);
        }
    }
}

module.exports = new AchievementTrackerHelper();
