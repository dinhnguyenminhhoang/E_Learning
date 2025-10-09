"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const LearningPath = require("../LearningPath");
const Target = require("../Target");

(async () => {
  const mongoUri = "mongodb+srv://dinhnguyenminhhoang28_db_user:VJPDqSQvDyy4itff@elearing.wrocmb3.mongodb.net/E_Learing?retryWrites=true&w=majority&appName=eLearing" || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected successfully.");

    const targets = await Target.find({});
    if (targets.length === 0) {
      throw new Error("⚠️ You must seed Target first!");
    }

    const getTargetId = (key) =>
      targets.find((t) => t.key === key)?._id || null;

    const learningPaths = [
      {
        target: getTargetId("TRAVEL_ENGLISH"),
        key: "TRAVEL_ENGLISH_PATH",
        title: "Travel English Path",
        description: "Learn essential phrases and vocabulary for traveling abroad.",
        levels: [
          { order: 1, title: "Basic Travel", quizzes: [] },
          { order: 2, title: "Airport & Hotel", quizzes: [] },
          { order: 3, title: "Advanced Travel Situations", quizzes: [] },
        ],
      },
      {
        target: getTargetId("BUSINESS_ENGLISH"),
        key: "BUSINESS_ENGLISH_PATH",
        title: "Business English Path",
        description: "Master English for meetings, presentations, and emails.",
        levels: [
          { order: 1, title: "Office Basics", quizzes: [] },
          { order: 2, title: "Business Communication", quizzes: [] },
          { order: 3, title: "Negotiation & Presentations", quizzes: [] },
        ],
      },
      {
        target: getTargetId("EXAM_PREP"),
        key: "EXAM_PREP_PATH",
        title: "Exam Preparation Path",
        description: "Structured path to prepare for IELTS or TOEIC.",
        levels: [
          { order: 1, title: "Vocabulary Builder", quizzes: [] },
          { order: 2, title: "Listening Practice", quizzes: [] },
          { order: 3, title: "Mock Tests", quizzes: [] },
        ],
      },
      {
        target: getTargetId("DAILY_CONVERSATION"),
        key: "DAILY_CONVERSATION_PATH",
        title: "Daily Conversation Path",
        description: "Improve your ability to speak English fluently in daily life.",
        levels: [
          { order: 1, title: "Everyday Expressions", quizzes: [] },
          { order: 2, title: "Speaking Practice", quizzes: [] },
          { order: 3, title: "Story Conversations", quizzes: [] },
        ],
      },
    ];

    await LearningPath.deleteMany({});
    console.log("🧹 Cleared old learning paths.");

    await LearningPath.insertMany(learningPaths);
    console.log(`✅ Seeded ${learningPaths.length} learning paths successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding learning paths:", err);
    process.exit(1);
  }
})();
