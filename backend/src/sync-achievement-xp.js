"use strict";

require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("./models/User");
const UserAchievement = require("./models/UserAchievement");

async function syncAchievementXP() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const completedAchievements = await UserAchievement.find({ isCompleted: true })
            .populate("achievement", "points name")
            .populate("user", "name statistics");

        console.log(`Found ${completedAchievements.length} completed achievements`);

        const userXpMap = new Map();

        for (const ua of completedAchievements) {
            if (!ua.achievement || !ua.user) continue;

            const userId = ua.user._id.toString();
            const points = ua.achievement.points || 0;

            if (points > 0) {
                const current = userXpMap.get(userId) || 0;
                userXpMap.set(userId, current + points);
                console.log(`User ${ua.user.name}: +${points} XP from "${ua.achievement.name}"`);
            }
        }

        console.log("\n=== Syncing XP to users ===");

        for (const [userId, totalXP] of userXpMap) {
            const user = await User.findById(userId);
            const currentXP = user?.statistics?.totalXP || 0;

            if (currentXP === 0 && totalXP > 0) {
                await User.findByIdAndUpdate(userId, {
                    $set: {
                        "statistics.totalXP": totalXP,
                        "statistics.weeklyXP": totalXP,
                        "statistics.monthlyXP": totalXP,
                        "statistics.lastXPUpdate": new Date(),
                    }
                });
                console.log(`Updated user ${userId}: 0 -> ${totalXP} XP`);
            } else {
                console.log(`User ${userId} already has ${currentXP} XP, skipping`);
            }
        }

        console.log("\nDone!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

syncAchievementXP();
