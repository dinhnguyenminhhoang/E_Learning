/**
 * Script to initialize UserBlockProgress for existing users
 * This script will create block progress records for all users who have enrolled in lessons
 *
 * Usage: node src/scripts/initializeUserBlockProgress.js
 */

"use strict";

require("../models");

const mongoose = require("mongoose");
const UserBlockProgress = require("../models/UserBlockProgress");
const Lesson = require("../models/Lessson");
const User = require("../models/User");
const UserLearningPath = require("../models/UserLearningPath");

// Database connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/e_learning";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const initializeBlockProgress = async () => {
  try {
    console.log("\n🚀 Starting UserBlockProgress initialization...\n");

    // Get all users
    const users = await User.find({ status: { $ne: "deleted" } });
    console.log(`📊 Found ${users.length} users`);

    // Get all active lessons
    const lessons = await Lesson.find({ status: "active" });
    console.log(`📚 Found ${lessons.length} active lessons\n`);

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email || user._id}`);

      // Get user's learning paths to determine which lessons they're enrolled in
      const userLearningPaths = await UserLearningPath.find({ user: user._id });

      if (userLearningPaths.length === 0) {
        console.log(`   ℹ️  User has no learning paths, skipping...`);
        continue;
      }

      for (const enrollment of userLearningPaths) {
        const lesson = lessons.find((l) => l._id.equals(enrollment.lesson));

        if (!lesson) continue;

        const existingProgress = await UserBlockProgress.find({
          user: user._id,
          lesson: lesson._id,
          deletedAt: null,
        });

        if (existingProgress.length > 0) {
          console.log(
            `   ⏭️  Block progress already exists for lesson: ${lesson.title}`
          );
          totalSkipped += existingProgress.length;
          continue;
        }

        if (!lesson.blocks || lesson.blocks.length === 0) {
          console.log(
            `   ⚠️  Lesson "${lesson.title}" has no blocks, skipping...`
          );
          continue;
        }

        const blockProgressData = lesson.blocks.map((blockInfo, index) => ({
          user: user._id,
          lesson: lesson._id,
          block: blockInfo.block,
          blockOrder: blockInfo.order || index,
          status: index === 0 ? "not_started" : "locked",
          isLocked: index !== 0,
          exerciseCompleted: false,
          attempts: 0,
          lastAttemptScore: 0,
          timeSpent: 0,
        }));

        const created = await UserBlockProgress.insertMany(blockProgressData);
        totalCreated += created.length;

        console.log(
          `   ✅ Created ${created.length} block progress records for lesson: ${lesson.title}`
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✨ Initialization Complete!");
    console.log("=".repeat(60));
    console.log(`✅ Total Created: ${totalCreated}`);
    console.log(`⏭️  Total Skipped: ${totalSkipped}`);
    console.log(`📊 Total Processed: ${totalCreated + totalSkipped}`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error during initialization:", error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await initializeBlockProgress();
    console.log("✅ Script completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { initializeBlockProgress };
