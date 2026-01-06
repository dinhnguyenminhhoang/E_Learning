/**
 * Clear all seed data from database
 * Run: node src/scripts/clearSeedData.js
 */

const mongoose = require("mongoose");
const Word = require("../models/Word");
const FlashCard = require("../models/FlashCard");
const CardDeck = require("../models/CardDeck");
const ContentBlock = require("../models/subModel/contentBlock.schema");
const Lesson = require("../models/Lessson");
const Quiz = require("../models/Quiz");

const MONGODB_URI = "mongodb+srv://dinhnguyenminhhoang28_db_user:VJPDqSQvDyy4itff@elearing.wrocmb3.mongodb.net/E_Learing?retryWrites=true&w=majority&appName=eLearing";

async function clearDatabase() {
    try {
        console.log("🗑️  Starting database cleanup...\n");

        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // Delete in order (children first, then parents)
        console.log("  🧹 Deleting quizzes...");
        const quizResult = await Quiz.deleteMany({});
        console.log(`  ✅ Deleted ${quizResult.deletedCount} quizzes`);

        console.log("  🧹 Deleting content blocks...");
        const blockResult = await ContentBlock.deleteMany({});
        console.log(`  ✅ Deleted ${blockResult.deletedCount} blocks`);

        console.log("  🧹 Deleting lessons...");
        const lessonResult = await Lesson.deleteMany({});
        console.log(`  ✅ Deleted ${lessonResult.deletedCount} lessons`);

        console.log("  🧹 Deleting flashcards...");
        const flashcardResult = await FlashCard.deleteMany({});
        console.log(`  ✅ Deleted ${flashcardResult.deletedCount} flashcards`);

        console.log("  🧹 Deleting card decks...");
        const deckResult = await CardDeck.deleteMany({});
        console.log(`  ✅ Deleted ${deckResult.deletedCount} card decks`);

        console.log("  🧹 Deleting words...");
        const wordResult = await Word.deleteMany({});
        console.log(`  ✅ Deleted ${wordResult.deletedCount} words`);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 DATABASE CLEANUP COMPLETE!");
        console.log("=".repeat(60));
        console.log("\nTotal deleted:");
        console.log(`  - Quizzes: ${quizResult.deletedCount}`);
        console.log(`  - Blocks: ${blockResult.deletedCount}`);
        console.log(`  - Lessons: ${lessonResult.deletedCount}`);
        console.log(`  - Flashcards: ${flashcardResult.deletedCount}`);
        console.log(`  - Card Decks: ${deckResult.deletedCount}`);
        console.log(`  - Words: ${wordResult.deletedCount}`);
        console.log("\n✅ Database is now clean and ready for reseeding!\n");

    } catch (error) {
        console.error("\n❌ Cleanup failed:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
        process.exit(0);
    }
}

if (require.main === module) {
    clearDatabase();
}

module.exports = { clearDatabase };
