"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const Target = require("../Target"); // model Target

const targets = [
  {
    key: "TRAVEL_ENGLISH",
    name: "Travel English",
    description: "Learn English for traveling confidently around the world",
    tags: ["travel", "tourism", "conversation"],
  },
  {
    key: "BUSINESS_ENGLISH",
    name: "Business English",
    description: "Improve your English for professional and corporate communication",
    tags: ["office", "meeting", "email"],
  },
  {
    key: "EXAM_PREP",
    name: "Exam Preparation",
    description: "Prepare for IELTS, TOEIC, and TOEFL exams effectively",
    tags: ["exam", "ielts", "toeic", "toefl"],
  },
  {
    key: "DAILY_CONVERSATION",
    name: "Daily Conversation",
    description: "Speak English confidently in everyday situations",
    tags: ["speaking", "listening", "daily"],
  },
  {
    key: "STUDY_ABROAD",
    name: "Study Abroad",
    description: "Get ready for studying in an English-speaking environment",
    tags: ["academic", "student", "university"],
  },
  {
    key: "JOB_INTERVIEW",
    name: "Job Interview",
    description: "Prepare for English job interviews with confidence",
    tags: ["career", "communication", "speaking"],
  },
];

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

    await Target.deleteMany({});
    console.log("🧹 Cleared old targets.");

    await Target.insertMany(targets);
    console.log(`✅ Seeded ${targets.length} targets successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding targets:", err);
    process.exit(1);
  }
})();
