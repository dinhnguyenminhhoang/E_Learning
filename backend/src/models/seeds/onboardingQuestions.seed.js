"use strict";

require("dotenv").config();
const mongoose = require("mongoose");

const OnboardingQuestion = require("../OnboardingQuestion");

const onboardingQuestions = [
  // 1️⃣ GOALS
  {
    key: "GOALS",
    title: "What's your learning goal?",
    description: "Choose one or more goals that fit you best",
    type: "single",
    options: [
      {
        key: "TRAVEL_ENGLISH",
        label: "Travel English",
        icon: "✈️",
        description: "Learn English for traveling around the world",
      },
      {
        key: "BUSINESS_ENGLISH",
        label: "Business English",
        icon: "💼",
        description: "Improve your English for professional communication",
      },
      {
        key: "EXAM_PREP",
        label: "Exam Preparation",
        icon: "📘",
        description: "Prepare for IELTS, TOEIC or TOEFL exams",
      },
      {
        key: "DAILY_CONVERSATION",
        label: "Daily Conversation",
        icon: "🗣️",
        description: "Speak English confidently in everyday situations",
      },
      {
        key: "STUDY_ABROAD",
        label: "Study Abroad",
        icon: "🎓",
        description: "Get ready for studying in an English-speaking country",
      },
      {
        key: "JOB_INTERVIEW",
        label: "Job Interview",
        icon: "🧑‍💼",
        description: "Prepare for English job interviews with confidence",
      },
    ],
    order: 1,
    isActive: true,
  },

  // 2️⃣ TIME_COMMITMENT
  {
    key: "TIME_COMMITMENT",
    title: "How much time can you commit daily?",
    description: "Select how much time you can spend learning English each day",
    type: "single",
    options: [
      {
        key: "5_MINUTES",
        label: "5 minutes",
        icon: "⏱️",
        description: "Quick daily practice for busy learners",
      },
      {
        key: "15_MINUTES",
        label: "15 minutes",
        icon: "⌚",
        description: "Perfect for steady daily progress",
      },
      {
        key: "30_MINUTES",
        label: "30 minutes",
        icon: "🕒",
        description: "Ideal for learners who want faster improvement",
      },
      {
        key: "60_MINUTES",
        label: "1 hour",
        icon: "🕐",
        description: "Deep learning sessions for committed learners",
      },
    ],
    order: 2,
    isActive: true,
  },

  // 3️⃣ LEARNING_STYLE
  {
    key: "LEARNING_STYLE",
    title: "What's your preferred learning style?",
    description: "Choose how you like to learn best",
    type: "single",
    options: [
      {
        key: "VIDEO_BASED",
        label: "Video Lessons",
        icon: "🎥",
        description: "Learn by watching and listening to real conversations",
      },
      {
        key: "READING_BASED",
        label: "Reading Practice",
        icon: "📖",
        description: "Improve by reading stories and articles",
      },
      {
        key: "PRACTICE_BASED",
        label: "Interactive Practice",
        icon: "🎮",
        description: "Learn by doing and repeating exercises",
      },
      {
        key: "CONVERSATION_BASED",
        label: "Speaking Practice",
        icon: "💬",
        description: "Improve through speaking and real dialogue",
      },
    ],
    order: 3,
    isActive: true,
  },

  // 4️⃣ LEVEL
  {
    key: "LEVEL",
    title: "What's your current English level?",
    description: "Select the level that best describes your current ability",
    type: "single",
    options: [
      {
        key: "BEGINNER",
        label: "Beginner (A1)",
        icon: "🌱",
        description: "You know some basic words and phrases",
      },
      {
        key: "ELEMENTARY",
        label: "Elementary (A2)",
        icon: "📗",
        description: "You can understand simple everyday expressions",
      },
      {
        key: "INTERMEDIATE",
        label: "Intermediate (B1)",
        icon: "📘",
        description: "You can communicate in most everyday situations",
      },
      {
        key: "UPPER_INTERMEDIATE",
        label: "Upper Intermediate (B2)",
        icon: "📙",
        description: "You can speak comfortably about familiar topics",
      },
      {
        key: "ADVANCED",
        label: "Advanced (C1+)",
        icon: "🏆",
        description: "You can express yourself fluently and naturally",
      },
    ],
    order: 4,
    isActive: true,
  },
];

(async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    console.log("✅ Connected successfully.");

    // Xóa dữ liệu cũ
    await OnboardingQuestion.deleteMany({});
    console.log("🧹 Cleared old onboarding questions.");

    // Thêm dữ liệu mới
    await OnboardingQuestion.insertMany(onboardingQuestions);
    console.log(`✅ Seeded ${onboardingQuestions.length} onboarding questions successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding:", err);
    process.exit(1);
  }
})();
