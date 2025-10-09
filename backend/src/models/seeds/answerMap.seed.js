"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const AnswerMap = require("../AnswerMap"); // model AnswerMap
const Target = require("../Target"); // nếu bạn có model này
const LearningPath = require("../LearningPath");

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
    await AnswerMap.deleteMany({});
    console.log("🧹 Cleared old AnswerMap data.");

    // Tìm các Target và LearningPath đã có sẵn
    const travelTarget = await Target.findOne({ key: "TRAVEL_ENGLISH" });
    const businessTarget = await Target.findOne({ key: "BUSINESS_ENGLISH" });
    const examTarget = await Target.findOne({ key: "EXAM_PREP" });
    const conversationTarget = await Target.findOne({ key: "DAILY_CONVERSATION" });

    const travelLP = await LearningPath.findOne({ key: "TRAVEL_ENGLISH_PATH" });
    const businessLP = await LearningPath.findOne({ key: "BUSINESS_ENGLISH_PATH" });
    const examLP = await LearningPath.findOne({ key: "EXAM_PREP_PATH" });
    const conversationLP = await LearningPath.findOne({ key: "DAILY_CONVERSATION_PATH" });

    // Dữ liệu AnswerMap
    const answerMaps = [
      // 1️⃣ GOALS → Target + LearningPath
      {
        questionKey: "GOALS",
        rawValue: "TRAVEL_ENGLISH",
        target: travelTarget?._id || null,
        learningPath: travelLP?._id || null,
      },
      {
        questionKey: "GOALS",
        rawValue: "BUSINESS_ENGLISH",
        target: businessTarget?._id || null,
        learningPath: businessLP?._id || null,
      },
      {
        questionKey: "GOALS",
        rawValue: "EXAM_PREP",
        target: examTarget?._id || null,
        learningPath: examLP?._id || null,
      },
      {
        questionKey: "GOALS",
        rawValue: "DAILY_CONVERSATION",
        target: conversationTarget?._id || null,
        learningPath: conversationLP?._id || null,
      },

      // 2️⃣ TIME_COMMITMENT → normalizedValue (đổi thành số phút)
      { questionKey: "TIME_COMMITMENT", rawValue: "5_MINUTES", normalizedValue: "5" },
      { questionKey: "TIME_COMMITMENT", rawValue: "15_MINUTES", normalizedValue: "15" },
      { questionKey: "TIME_COMMITMENT", rawValue: "30_MINUTES", normalizedValue: "30" },
      { questionKey: "TIME_COMMITMENT", rawValue: "60_MINUTES", normalizedValue: "60" },

      // 3️⃣ LEARNING_STYLE → normalizedValue (định dạng cách học)
      { questionKey: "LEARNING_STYLE", rawValue: "VIDEO_BASED", normalizedValue: "VIDEO" },
      { questionKey: "LEARNING_STYLE", rawValue: "READING_BASED", normalizedValue: "READING" },
      { questionKey: "LEARNING_STYLE", rawValue: "PRACTICE_BASED", normalizedValue: "PRACTICE" },
      { questionKey: "LEARNING_STYLE", rawValue: "CONVERSATION_BASED", normalizedValue: "SPEAKING" },

      // 4️⃣ LEVEL → normalizedValue (chuẩn hóa CEFR)
      { questionKey: "LEVEL", rawValue: "BEGINNER", normalizedValue: "A1" },
      { questionKey: "LEVEL", rawValue: "ELEMENTARY", normalizedValue: "A2" },
      { questionKey: "LEVEL", rawValue: "INTERMEDIATE", normalizedValue: "B1" },
      { questionKey: "LEVEL", rawValue: "UPPER_INTERMEDIATE", normalizedValue: "B2" },
      { questionKey: "LEVEL", rawValue: "ADVANCED", normalizedValue: "C1" },
    ];

    await AnswerMap.insertMany(answerMaps);
    console.log(`✅ Seeded ${answerMaps.length} AnswerMap records successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding AnswerMap:", err);
    process.exit(1);
  }
})();
