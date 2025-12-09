/**
 * Seed script to populate initial set of achievements
 * Run with: node backend/src/seeds/seedAchievements.js
 */

"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const Achievement = require("../Achievement");

// Get MongoDB URI (hardcoded or from environment)
const MONGODB_URI = "mongodb+srv://dinhnguyenminhhoang28_db_user:VJPDqSQvDyy4itff@elearing.wrocmb3.mongodb.net/E_Learing?retryWrites=true&w=majority&appName=eLearing" || process.env.MONGO_URI;

// Connect to MongoDB
async function connect() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

// Default achievements to seed
const defaultAchievements = [
    // ===== STREAK ACHIEVEMENTS =====
    {
        name: "First Steps",
        nameVi: "Bước Đầu Tiên",
        description: "Study for 3 consecutive days",
        icon: "🔥",
        type: "streak",
        criteria: { target: 3, unit: "days" },
        rarity: "common",
        points: 10,
        status: "active",
    },
    {
        name: "Dedicated Learner",
        nameVi: "Người Học Tận Tụy",
        description: "Maintain a 7-day study streak",
        icon: "🔥",
        type: "streak",
        criteria: { target: 7, unit: "days" },
        rarity: "rare",
        points: 25,
        status: "active",
    },
    {
        name: "Unstoppable",
        nameVi: "Không Thể Ngăn Cản",
        description: "Achieve a 30-day study streak",
        icon: "🔥",
        type: "streak",
        criteria: { target: 30, unit: "days" },
        rarity: "epic",
        points: 100,
        status: "active",
    },
    {
        name: "Legend",
        nameVi: "Huyền Thoại",
        description: "Maintain a 100-day study streak",
        icon: "🔥",
        type: "streak",
        criteria: { target: 100, unit: "days" },
        rarity: "legendary",
        points: 500,
        status: "active",
    },

    // ===== QUIZ SCORE ACHIEVEMENTS =====
    {
        name: "First Victory",
        nameVi: "Chiến Thắng Đầu Tiên",
        description: "Complete your first quiz successfully",
        icon: "🎯",
        type: "quiz_score",
        criteria: { target: 60, unit: "percentage" },
        rarity: "common",
        points: 10,
        status: "active",
    },
    {
        name: "Perfect Score",
        nameVi: "Điểm Tuyệt Đối",
        description: "Achieve 100% on any quiz",
        icon: "💯",
        type: "quiz_score",
        criteria: { target: 100, unit: "percentage" },
        rarity: "rare",
        points: 50,
        status: "active",
    },
    {
        name: "Quiz Master",
        nameVi: "Bậc Thầy Quiz",
        description: "Score 90% or higher on a quiz",
        icon: "🏆",
        type: "quiz_score",
        criteria: { target: 90, unit: "percentage" },
        rarity: "epic",
        points: 75,
        status: "active",
    },
    {
        name: "Prodigy",
        nameVi: "Thần Đồng",
        description: "Score 95% or higher on an exam",
        icon: "⭐",
        type: "quiz_score",
        criteria: { target: 95, unit: "percentage" },
        rarity: "legendary",
        points: 150,
        status: "active",
    },

    // ===== WORDS LEARNED ACHIEVEMENTS =====
    {
        name: "Vocabulary Starter",
        nameVi: "Khởi Đầu Từ Vựng",
        description: "Learn your first 10 words",
        icon: "📖",
        type: "words_learned",
        criteria: { target: 10, unit: "words" },
        rarity: "common",
        points: 10,
        status: "active",
    },
    {
        name: "Word Collector",
        nameVi: "Người Sưu Tầm Từ",
        description: "Learn 50 new words",
        icon: "📚",
        type: "words_learned",
        criteria: { target: 50, unit: "words" },
        rarity: "rare",
        points: 30,
        status: "active",
    },
    {
        name: "Lexicon Builder",
        nameVi: "Người Xây Dựng Từ Điển",
        description: "Learn 100 words",
        icon: "📕",
        type: "words_learned",
        criteria: { target: 100, unit: "words" },
        rarity: "epic",
        points: 75,
        status: "active",
    },
    {
        name: "Master of Words",
        nameVi: "Bậc Thầy Từ Vựng",
        description: "Learn 500+ words",
        icon: "📗",
        type: "words_learned",
        criteria: { target: 500, unit: "words" },
        rarity: "legendary",
        points: 300,
        status: "active",
    },

    // ===== SESSION ACHIEVEMENTS =====
    {
        name: "Getting Started",
        nameVi: "Bắt Đầu Hành Trình",
        description: "Complete 5 study sessions",
        icon: "🎓",
        type: "sessions",
        criteria: { target: 5, unit: "sessions" },
        rarity: "common",
        points: 10,
        status: "active",
    },
    {
        name: "Consistent Student",
        nameVi: "Học Sinh Kiên Định",
        description: "Complete 10 study sessions",
        icon: "📝",
        type: "sessions",
        criteria: { target: 10, unit: "sessions" },
        rarity: "rare",
        points: 25,
        status: "active",
    },
    {
        name: "Dedicated Scholar",
        nameVi: "Học Giả Tận Tâm",
        description: "Complete 50 study sessions",
        icon: "🎖️",
        type: "sessions",
        criteria: { target: 50, unit: "sessions" },
        rarity: "epic",
        points: 100,
        status: "active",
    },
];

async function seedAchievements() {
    try {
        console.log("🌱 Starting achievement seeding...");

        // Clear existing achievements (optional - comment out if you want to keep existing)
        // await Achievement.deleteMany({});
        // console.log("🗑️  Cleared existing achievements");

        // Insert achievements
        const result = await Achievement.insertMany(defaultAchievements);
        console.log(`✅ Successfully seeded ${result.length} achievements`);

        // Display summary
        console.log("\n📊 Achievement Summary:");
        const summary = await Achievement.aggregate([
            { $group: { _id: "$rarity", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        summary.forEach((item) => {
            console.log(`   ${item._id}: ${item.count}`);
        });

        console.log("\n🎉 Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Error seeding achievements:", error);
        throw error;
    }
}

// Main execution
async function main() {
    try {
        await connect();
        await seedAchievements();
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("👋 Database connection closed");
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { seedAchievements, defaultAchievements };
