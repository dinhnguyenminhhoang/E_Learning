/**
 * Migration Script: Add New Fields to Flashcards and CardDecks
 *
 * This script adds default values for newly added fields:
 * - FlashCard: viewCount, studyCount, images, audio, hint, explanation
 * - CardDeck: viewCount, studyCount, cardCount, tags, difficulty, isPublic
 *
 * Run: node backend/scripts/migrate-flashcards-fields.js
 */

"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const FlashCard = require("../src/models/FlashCard");
const CardDeck = require("../src/models/CardDeck");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/e_learning";

async function migrateFlashcards() {
  console.log("\n🔄 Starting FlashCard migration...");

  try {
    const result = await FlashCard.updateMany(
      {
        $or: [
          { viewCount: { $exists: false } },
          { studyCount: { $exists: false } },
        ],
      },
      {
        $set: {
          viewCount: 0,
          studyCount: 0,
        },
      }
    );

    console.log(`✅ FlashCard migration completed:`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents`);

    return result;
  } catch (error) {
    console.error("❌ FlashCard migration failed:", error);
    throw error;
  }
}

async function migrateCardDecks() {
  console.log("\n🔄 Starting CardDeck migration...");

  try {
    const result = await CardDeck.updateMany(
      {
        $or: [
          { viewCount: { $exists: false } },
          { studyCount: { $exists: false } },
          { cardCount: { $exists: false } },
          { isPublic: { $exists: false } },
          { difficulty: { $exists: false } },
        ],
      },
      {
        $set: {
          viewCount: 0,
          studyCount: 0,
          cardCount: 0,
          isPublic: true,
          difficulty: "medium",
        },
      }
    );

    console.log(`✅ CardDeck migration completed:`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents`);

    return result;
  } catch (error) {
    console.error("❌ CardDeck migration failed:", error);
    throw error;
  }
}

async function updateCardCounts() {
  console.log("\n🔄 Updating card counts for all decks...");

  try {
    const decks = await CardDeck.find({ status: "active" });
    let updatedCount = 0;

    for (const deck of decks) {
      const count = await FlashCard.countDocuments({
        cardDeck: deck._id,
        status: "active",
      });

      if (deck.cardCount !== count) {
        deck.cardCount = count;
        await deck.save();
        updatedCount++;
      }
    }

    console.log(`✅ Card count update completed:`);
    console.log(`   - Total decks: ${decks.length}`);
    console.log(`   - Updated: ${updatedCount} decks`);

    return { total: decks.length, updated: updatedCount };
  } catch (error) {
    console.error("❌ Card count update failed:", error);
    throw error;
  }
}

async function verifyMigration() {
  console.log("\n🔍 Verifying migration...");

  try {
    const flashcardStats = await FlashCard.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withViewCount: {
            $sum: { $cond: [{ $ifNull: ["$viewCount", false] }, 1, 0] },
          },
          withStudyCount: {
            $sum: { $cond: [{ $ifNull: ["$studyCount", false] }, 1, 0] },
          },
        },
      },
    ]);

    const deckStats = await CardDeck.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withViewCount: {
            $sum: { $cond: [{ $ifNull: ["$viewCount", false] }, 1, 0] },
          },
          withStudyCount: {
            $sum: { $cond: [{ $ifNull: ["$studyCount", false] }, 1, 0] },
          },
          withCardCount: {
            $sum: { $cond: [{ $ifNull: ["$cardCount", false] }, 1, 0] },
          },
          withIsPublic: {
            $sum: { $cond: [{ $ifNull: ["$isPublic", false] }, 1, 0] },
          },
          withDifficulty: {
            $sum: { $cond: [{ $ifNull: ["$difficulty", false] }, 1, 0] },
          },
        },
      },
    ]);

    console.log("\n📊 Verification Results:");
    console.log("\nFlashCards:");
    if (flashcardStats.length > 0) {
      const stats = flashcardStats[0];
      console.log(`   Total: ${stats.total}`);
      console.log(`   With viewCount: ${stats.withViewCount} (${((stats.withViewCount / stats.total) * 100).toFixed(1)}%)`);
      console.log(`   With studyCount: ${stats.withStudyCount} (${((stats.withStudyCount / stats.total) * 100).toFixed(1)}%)`);
    } else {
      console.log("   No flashcards found");
    }

    console.log("\nCardDecks:");
    if (deckStats.length > 0) {
      const stats = deckStats[0];
      console.log(`   Total: ${stats.total}`);
      console.log(`   With viewCount: ${stats.withViewCount} (${((stats.withViewCount / stats.total) * 100).toFixed(1)}%)`);
      console.log(`   With studyCount: ${stats.withStudyCount} (${((stats.withStudyCount / stats.total) * 100).toFixed(1)}%)`);
      console.log(`   With cardCount: ${stats.withCardCount} (${((stats.withCardCount / stats.total) * 100).toFixed(1)}%)`);
      console.log(`   With isPublic: ${stats.withIsPublic} (${((stats.withIsPublic / stats.total) * 100).toFixed(1)}%)`);
      console.log(`   With difficulty: ${stats.withDifficulty} (${((stats.withDifficulty / stats.total) * 100).toFixed(1)}%)`);
    } else {
      console.log("   No card decks found");
    }

    return { flashcardStats, deckStats };
  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  }
}

async function runMigration() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   Flashcards & CardDecks Migration Script            ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Connecting to MongoDB: ${MONGODB_URI}\n`);

  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Run migrations
    await migrateFlashcards();
    await migrateCardDecks();
    await updateCardCounts();

    // Verify results
    await verifyMigration();

    console.log("\n✅ Migration completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Test the new statistics endpoints");
    console.log("   2. Update frontend UI to display statistics");
    console.log("   3. Monitor performance of new indexes\n");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run migration if executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  migrateFlashcards,
  migrateCardDecks,
  updateCardCounts,
  verifyMigration,
};
