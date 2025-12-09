"use strict";

const User = require("../models/User");
const ResponseBuilder = require("../types/response/baseResponse");
const RESPONSE_MESSAGES = require("../constants/responseMessage");

class LeaderboardService {
    async getLeaderboard(options = {}) {
        const {
            period = "allTime",
            limit = 100,
            offset = 0,
        } = options;

        const xpField = this.getXPField(period);

        try {
            const users = await User.find({
                status: "active",
            })
                .select("name email profile.avatar statistics")
                .sort({ [`statistics.${xpField}`]: -1, createdAt: 1 })
                .skip(offset)
                .limit(limit)
                .lean();

            const leaderboard = users.map((user, index) => ({
                id: user._id.toString(),
                rank: offset + index + 1,
                displayName: user.name || user.email.split("@")[0],
                avatarUrl: user.profile?.avatar || null,
                xp: user.statistics?.[xpField] || 0,
                rankChange: this.calculateRankChange(
                    user.statistics?.currentRank,
                    user.statistics?.previousRank
                ),
            }));

            // Get total count for pagination
            const total = await User.countDocuments({
                status: "active",
            });

            return ResponseBuilder.success(
                "Leaderboard fetched successfully",
                {
                    leaderboard,
                    pagination: {
                        total,
                        limit,
                        offset,
                        hasMore: offset + limit < total,
                    },
                },
                200
            );
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            return ResponseBuilder.error("Failed to fetch leaderboard", 500);
        }
    }
    async getUserRank(userId, period = "allTime") {
        const xpField = this.getXPField(period);

        try {
            const user = await User.findById(userId)
                .select("name email profile.avatar statistics")
                .lean();

            if (!user) {
                return ResponseBuilder.notFoundError("User not found");
            }

            const userXP = user.statistics?.[xpField] || 0;

            // Count users with higher XP to determine rank
            // If same XP, count users with same XP but earlier registration
            const rank = await User.countDocuments({
                status: "active",
                $or: [
                    { [`statistics.${xpField}`]: { $gt: userXP } },
                    {
                        [`statistics.${xpField}`]: userXP,
                        createdAt: { $lt: user.createdAt },
                    },
                ],
            }) + 1;

            // Get users above (3 users)
            const usersAbove = await User.find({
                status: "active",
                $or: [
                    { [`statistics.${xpField}`]: { $gt: userXP } },
                    {
                        [`statistics.${xpField}`]: userXP,
                        createdAt: { $lt: user.createdAt },
                    },
                ],
            })
                .select("name email profile.avatar statistics")
                .sort({ [`statistics.${xpField}`]: -1, createdAt: 1 })
                .limit(3)
                .lean();

            // Get users below (3 users)
            const usersBelow = await User.find({
                status: "active",
                $or: [
                    { [`statistics.${xpField}`]: { $lt: userXP } },
                    {
                        [`statistics.${xpField}`]: userXP,
                        createdAt: { $gt: user.createdAt },
                    },
                ],
            })
                .select("name email profile.avatar statistics")
                .sort({ [`statistics.${xpField}`]: -1, createdAt: 1 })
                .limit(3)
                .lean();

            const currentUser = {
                id: user._id.toString(),
                rank,
                displayName: user.name || user.email.split("@")[0],
                avatarUrl: user.profile?.avatar || null,
                xp: userXP,
                isCurrentUser: true,
                rankChange: this.calculateRankChange(
                    user.statistics?.currentRank,
                    user.statistics?.previousRank
                ),
            };

            return ResponseBuilder.success(
                "User rank fetched successfully",
                {
                    currentUser,
                    usersAbove: usersAbove.map((u, i) => ({
                        id: u._id.toString(),
                        rank: rank - usersAbove.length + i,
                        displayName: u.name || u.email.split("@")[0],
                        avatarUrl: u.profile?.avatar || null,
                        xp: u.statistics?.[xpField] || 0,
                    })),
                    usersBelow: usersBelow.map((u, i) => ({
                        id: u._id.toString(),
                        rank: rank + i + 1,
                        displayName: u.name || u.email.split("@")[0],
                        avatarUrl: u.profile?.avatar || null,
                        xp: u.statistics?.[xpField] || 0,
                    })),
                },
                200
            );
        } catch (error) {
            console.error("Error fetching user rank:", error);
            return ResponseBuilder.error("Failed to fetch user rank", 500);
        }
    }
    async addXP(userId, amount, source = "unknown") {
        if (!amount || amount <= 0) {
            return ResponseBuilder.badRequest("Invalid XP amount");
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return ResponseBuilder.notFoundError("User not found");
            }
            user.statistics.totalXP = (user.statistics.totalXP || 0) + amount;
            user.statistics.weeklyXP = (user.statistics.weeklyXP || 0) + amount;
            user.statistics.monthlyXP = (user.statistics.monthlyXP || 0) + amount;
            user.statistics.lastXPUpdate = new Date();

            await user.save();

            console.log(
                `✅ Added ${amount} XP to user ${user.name} from ${source}. Total: ${user.statistics.totalXP}`
            );

            return ResponseBuilder.success(
                "XP added successfully",
                {
                    xpAdded: amount,
                    totalXP: user.statistics.totalXP,
                    weeklyXP: user.statistics.weeklyXP,
                    monthlyXP: user.statistics.monthlyXP,
                },
                200
            );
        } catch (error) {
            console.error("Error adding XP:", error);
            return ResponseBuilder.error("Failed to add XP", 500);
        }
    }

    async resetPeriodicXP(period) {
        if (!["weekly", "monthly"].includes(period)) {
            return ResponseBuilder.badRequest("Invalid period");
        }

        try {
            const field = period === "weekly" ? "weeklyXP" : "monthlyXP";

            const users = await User.find({ status: "active" })
                .sort({ [`statistics.${field}`]: -1, createdAt: 1 })
                .select("_id statistics")
                .lean();

            const bulkOps = users.map((user, index) => ({
                updateOne: {
                    filter: { _id: user._id },
                    update: {
                        $set: {
                            "statistics.previousRank": user.statistics?.currentRank || null,
                            "statistics.currentRank": index + 1,
                            [`statistics.${field}`]: 0,
                        },
                    },
                },
            }));

            const result = await User.bulkWrite(bulkOps);

            console.log(`🔄 Reset ${period} XP for ${result.modifiedCount} users`);

            return ResponseBuilder.success(
                `${period} XP reset successfully`,
                {
                    resetCount: result.modifiedCount,
                    period,
                },
                200
            );
        } catch (error) {
            console.error(`Error resetting ${period} XP:`, error);
            return ResponseBuilder.error(`Failed to reset ${period} XP`, 500);
        }
    }


    getXPField(period) {
        switch (period) {
            case "weekly":
                return "weeklyXP";
            case "monthly":
                return "monthlyXP";
            case "allTime":
            default:
                return "totalXP";
        }
    }

    calculateRankChange(currentRank, previousRank) {
        if (!previousRank || !currentRank) return "same";
        if (currentRank < previousRank) return "up"; // Lower number = better rank
        if (currentRank > previousRank) return "down";
        return "same";
    }
}

module.exports = new LeaderboardService();
