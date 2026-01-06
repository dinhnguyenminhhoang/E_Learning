/**
 * SEED SCRIPT: Execute comprehensive seed data for all 10 topics
 * Run: node src/scripts/seedComprehensive.js
 */

const mongoose = require("mongoose");
const Word = require("../models/Word");
const FlashCard = require("../models/FlashCard");
const CardDeck = require("../models/CardDeck");
const ContentBlock = require("../models/subModel/contentBlock.schema");
const GrammarBlock = require("../models/subModel/grammarBlock.schema");
const VocabularyBlock = require("../models/subModel/VocabularyBlock.schema");
const MediaBlock = require("../models/subModel/mediaBlock.schema");
const Lesson = require("../models/Lessson");
const Quiz = require("../models/Quiz");
const Category = require("../models/Category");
const { STATUS } = require("../constants/status.constans");

// Import seed data
const { new20Topics } = require("../models/seeds/new20Topics.seed");
const comprehensiveSeedData = new20Topics;

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://dinhnguyenminhhoang28_db_user:VJPDqSQvDyy4itff@elearing.wrocmb3.mongodb.net/E_Learing?retryWrites=true&w=majority&appName=eLearing";

/**
 * Seed one complete topic
 */
async function seedTopic(topicData, categoryId) {
    console.log(`\n🌱 Seeding: ${topicData.topicName}`);

    try {
        // 1. Create Category if needed (optional, use existing categoryId)
        console.log("  📁 Using category:", categoryId);

        // 2. Create Words
        console.log("  📝 Creating words...");
        const createdWords = await Word.insertMany(topicData.words);
        console.log(`  ✅ Created ${createdWords.length} words`);

        // 3. Create Card Deck
        console.log("  🎴 Creating card deck...");
        const cardDeck = await CardDeck.create({
            ...topicData.cardDeck,
            categoryId: categoryId
        });
        console.log(`  ✅ Created card deck: ${cardDeck.title}`);

        // 4. Create Flashcards (linking Words to CardDeck)
        console.log("  🃏 Creating flashcards...");
        const flashcards = createdWords.map((word, index) => ({
            word: word._id,
            frontText: word.word,
            backText: word.definitions[0].meaningVi,
            cardDeck: cardDeck._id,
            difficulty: word.level === "beginner" ? "easy" : word.level === "intermediate" ? "medium" : "hard",
            status: STATUS.ACTIVE
        }));
        const createdFlashcards = await FlashCard.insertMany(flashcards);
        console.log(`  ✅ Created ${createdFlashcards.length} flashcards`);

        // Update card deck count
        await cardDeck.updateCardCount();

        // 5. Create Lesson
        console.log("  📚 Creating lesson...");
        const lesson = await Lesson.create({
            ...topicData.lesson,
            categoryId: categoryId,
            blocks: [] // Will add blocks shortly
        });
        console.log(`  ✅ Created lesson: ${lesson.title}`);

        // 6. Create Blocks
        console.log("  🧱 Creating blocks...");
        const createdBlocks = [];

        for (const blockData of topicData.blocks) {
            let block;

            if (blockData.type === "grammar") {
                block = await GrammarBlock.create({
                    ...blockData,
                    lessonId: lesson._id
                });
            } else if (blockData.type === "vocabulary") {
                block = await VocabularyBlock.create({
                    ...blockData,
                    lessonId: lesson._id,
                    cardDeck: cardDeck._id
                });
            } else if (blockData.type === "media") {
                block = await MediaBlock.create({
                    ...blockData,
                    lessonId: lesson._id
                });
            }

            if (block) {
                createdBlocks.push(block);
                console.log(`    ✓ Created ${block.type} block: ${block.title}`);
            }
        }

        // 7. Create Quiz (Exercise)
        console.log("  📝 Creating quiz...");
        const quiz = await Quiz.create({
            ...topicData.quiz,
            attachedTo: {
                kind: "Lesson",
                item: lesson._id
            }
        });
        console.log(`  ✅ Created quiz: ${quiz.title}`);

        // 8. Update Lesson with Blocks and Exercise
        console.log("  🔗 Linking blocks to lesson...");
        lesson.blocks = createdBlocks.map((block, index) => ({
            block: block._id,
            exercise: index === 0 ? quiz._id : null, // Attach quiz to first block
            order: index + 1
        }));
        await lesson.save();
        console.log(`  ✅ Linked ${createdBlocks.length} blocks to lesson`);

        console.log(`\n✅ Successfully seeded: ${topicData.topicName}\n`);

        return {
            topic: topicData.topicName,
            words: createdWords.length,
            flashcards: createdFlashcards.length,
            cardDeck: cardDeck._id,
            blocks: createdBlocks.length,
            lesson: lesson._id,
            quiz: quiz._id
        };
    } catch (error) {
        console.error(`❌ Error seeding ${topicData.topicName}:`, error);
        throw error;
    }
}

/**
 * Main seed function
 */
async function seedAllTopics() {
    try {
        console.log("🚀 Starting comprehensive seeding...\n");

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // Get or create default category
        let category = await Category.findOne({ name: "General English" });
        if (!category) {
            category = await Category.create({
                name: "General English",
                nameVi: "Tiếng Anh Tổng Quát",
                description: "General English learning topics",
                status: STATUS.ACTIVE
            });
            console.log("✅ Created default category\n");
        }

        // Seed all topics
        const results = [];
        for (const topicData of comprehensiveSeedData) {
            const result = await seedTopic(topicData, category._id);
            results.push(result);
        }

        // Summary
        console.log("\n" + "=".repeat(60));
        console.log("🎉 SEEDING COMPLETE!");
        console.log("=".repeat(60));
        console.log("\nSummary:");
        results.forEach((r, i) => {
            console.log(`\n${i + 1}. ${r.topic}`);
            console.log(`   - Words: ${r.words}`);
            console.log(`   - Flashcards: ${r.flashcards}`);
            console.log(`   - Blocks: ${r.blocks}`);
            console.log(`   - Lesson ID: ${r.lesson}`);
            console.log(`   - Quiz ID: ${r.quiz}`);
        });
        console.log("\n" + "=".repeat(60));

    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    seedAllTopics();
}

module.exports = { seedAllTopics, seedTopic };
