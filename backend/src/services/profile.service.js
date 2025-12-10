"use strict";

const ResponseBuilder = require("../types/response/baseResponse");
const HTTP_STATUS = require("../constants/httpStatus");
const ProfileRepository = require("../repositories/profile.repo");
const UserAchievementRepository = require("../repositories/userAchievement.repo");

class ProfileService {
    _calculateLevel(totalXP) {
        let level = 1;
        let xpForCurrentLevel = 0;
        let xpForNextLevel = 100;

        while (totalXP >= xpForNextLevel) {
            level++;
            xpForCurrentLevel = xpForNextLevel;
            xpForNextLevel = xpForCurrentLevel + (level * 100) + ((level - 1) * 50);
        }

        return {
            level,
            xp: totalXP,
            nextLevelXp: xpForNextLevel,
            progressInLevel: totalXP - xpForCurrentLevel,
            xpNeededForNext: xpForNextLevel - xpForCurrentLevel
        };
    }

    _getRankTitle(level) {
        if (level >= 50) return "Huyền Thoại";
        if (level >= 40) return "Kim Cương";
        if (level >= 30) return "Bạch Kim";
        if (level >= 20) return "Vàng";
        if (level >= 10) return "Bạc";
        if (level >= 5) return "Đồng";
        return "Người Mới";
    }

    async getMyProfile(req) {
        const userId = req.user?._id;

        try {
            const user = await ProfileRepository.getProfile(userId);

            if (!user) {
                return ResponseBuilder.notFoundError("User không tồn tại.");
            }

            const stats = user.statistics || {};
            const levelInfo = this._calculateLevel(stats.totalXP || 0);
            const rank = this._getRankTitle(levelInfo.level);
            const completedAchievements = await UserAchievementRepository.getCompletedCount(userId);

            const profileData = {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || "",
                avatar: user.profile?.avatar || "",
                bio: user.profile?.bio || "",
                joinDate: user.createdAt,
                level: levelInfo.level,
                xp: levelInfo.xp,
                nextLevelXp: levelInfo.nextLevelXp,
                progressInLevel: levelInfo.progressInLevel,
                xpNeededForNext: levelInfo.xpNeededForNext,
                rank: rank,
                statistics: {
                    totalWordsLearned: stats.totalWordsLearned || 0,
                    currentStreak: stats.currentStreak || 0,
                    longestStreak: stats.longestStreak || 0,
                    currentLoginStreak: stats.currentLoginStreak || 0,
                    longestLoginStreak: stats.longestLoginStreak || 0,
                    totalStudyTime: stats.totalStudyTime || 0,
                    averageAccuracy: stats.averageAccuracy || 0,
                    totalXP: stats.totalXP || 0,
                    weeklyXP: stats.weeklyXP || 0,
                    monthlyXP: stats.monthlyXP || 0,
                    completedAchievements: completedAchievements,
                },
                learningPreferences: user.profile?.learningPreferences || {
                    dailyGoal: 10,
                    studyReminder: true,
                    difficultyLevel: "beginner"
                }
            };

            return ResponseBuilder.success("Lấy profile thành công.", profileData);
        } catch (error) {
            console.error("[ProfileService] Error getting profile:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy profile.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async updateMyProfile(req) {
        const userId = req.user?._id;
        const { name, phoneNumber, bio, avatar, learningPreferences } = req.body;

        try {
            const updateData = {};

            if (name !== undefined) updateData.name = name;
            if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
            if (bio !== undefined) updateData["profile.bio"] = bio;
            if (avatar !== undefined) updateData["profile.avatar"] = avatar;

            if (learningPreferences) {
                if (learningPreferences.dailyGoal !== undefined) {
                    updateData["profile.learningPreferences.dailyGoal"] = learningPreferences.dailyGoal;
                }
                if (learningPreferences.studyReminder !== undefined) {
                    updateData["profile.learningPreferences.studyReminder"] = learningPreferences.studyReminder;
                }
                if (learningPreferences.preferredStudyTime !== undefined) {
                    updateData["profile.learningPreferences.preferredStudyTime"] = learningPreferences.preferredStudyTime;
                }
                if (learningPreferences.difficultyLevel !== undefined) {
                    updateData["profile.learningPreferences.difficultyLevel"] = learningPreferences.difficultyLevel;
                }
            }

            const updatedUser = await ProfileRepository.updateProfile(userId, updateData);

            if (!updatedUser) {
                return ResponseBuilder.notFoundError("User không tồn tại.");
            }

            return ResponseBuilder.success("Cập nhật profile thành công.", {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber || "",
                avatar: updatedUser.profile?.avatar || "",
                bio: updatedUser.profile?.bio || "",
                learningPreferences: updatedUser.profile?.learningPreferences || {}
            });
        } catch (error) {
            console.error("[ProfileService] Error updating profile:", error);
            return ResponseBuilder.error(
                "Lỗi khi cập nhật profile.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async getWeeklyStats(req) {
        const userId = req.user?._id;

        try {
            const today = new Date();
            const stats = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                stats.push({
                    date: date.toISOString().split("T")[0],
                    wordsLearned: 0,
                    studyTime: 0,
                    quizzesTaken: 0,
                    xpEarned: 0
                });
            }

            return ResponseBuilder.success("Lấy thống kê tuần thành công.", stats);
        } catch (error) {
            console.error("[ProfileService] Error getting weekly stats:", error);
            return ResponseBuilder.error(
                "Lỗi khi lấy thống kê.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async updateAvatar(req) {
        const userId = req.user?._id;
        const { avatarUrl } = req.body;

        if (!avatarUrl) {
            return ResponseBuilder.error("Avatar URL is required.", HTTP_STATUS.BAD_REQUEST);
        }

        try {
            const result = await ProfileRepository.updateAvatar(userId, avatarUrl);

            if (!result) {
                return ResponseBuilder.notFoundError("User không tồn tại.");
            }

            return ResponseBuilder.success("Cập nhật avatar thành công.", {
                avatar: result.profile?.avatar
            });
        } catch (error) {
            console.error("[ProfileService] Error updating avatar:", error);
            return ResponseBuilder.error(
                "Lỗi khi cập nhật avatar.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

module.exports = new ProfileService();
