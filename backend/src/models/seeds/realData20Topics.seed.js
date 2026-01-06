const { STATUS } = require("../../constants/status.constans");

/**
 * 20 REAL TOPICS WITH AUTHENTIC VOCABULARY
 * Each topic contains 15 real English words with accurate definitions
 */

// TOPIC 1: Daily Routines & Habits
const topic1_dailyRoutines = {
  name: "Daily Routines & Habits",
  level: "beginner",
  skill: "reading",
  words: [
    {
      word: "wake up",
      pronunciation: "/weɪk ʌp/",
      partOfSpeech: "phrasal verb",
      level: "beginner",
      definitions: [
        {
          meaningEn: "to stop sleeping and become conscious",
          meaningVi: "thức dậy, tỉnh giấc",
          example: "I usually wake up at 7 AM.",
          exampleVi: "Tôi thường thức dậy lúc 7 giờ sáng.",
        },
      ],
      tags: ["daily-routine", "morning"],
    },
    {
      word: "breakfast",
      pronunciation: "/ˈbrekfəst/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "the first meal of the day",
          meaningVi: "bữa sáng",
          example: "I have breakfast at 8 o'clock.",
          exampleVi: "Tôi ăn sáng lúc 8 giờ.",
        },
      ],
      tags: ["daily-routine", "food"],
    },
    {
      word: "commute",
      pronunciation: "/kəˈmjuːt/",
      partOfSpeech: "verb",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "to travel regularly between work and home",
          meaningVi: "đi lại (giữa nhà và nơi làm việc)",
          example: "I commute to work by train every day.",
          exampleVi: "Tôi đi làm bằng tàu hỏa mỗi ngày.",
        },
      ],
      tags: ["daily-routine", "transport"],
    },
    {
      word: "routine",
      pronunciation: "/ruːˈtiːn/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "a regular way of doing things in a particular order",
          meaningVi: "thói quen, công việc thường ngày",
          example: "My morning routine includes exercise.",
          exampleVi: "Thói quen buổi sáng của tôi bao gồm tập thể dục.",
        },
      ],
      tags: ["daily-routine", "habit"],
    },
    {
      word: "shower",
      pronunciation: "/ˈʃaʊər/",
      partOfSpeech: "verb",
      level: "beginner",
      definitions: [
        {
          meaningEn: "to wash yourself under a spray of water",
          meaningVi: "tắm vòi sen",
          example: "I shower every morning.",
          exampleVi: "Tôi tắm mỗi sáng.",
        },
      ],
      tags: ["daily-routine", "hygiene"],
    },
    {
      word: "brush",
      pronunciation: "/brʌʃ/",
      partOfSpeech: "verb",
      level: "beginner",
      definitions: [
        {
          meaningEn: "to clean your teeth with a brush",
          meaningVi: "đánh răng",
          example: "Don't forget to brush your teeth.",
          exampleVi: "Đừng quên đánh răng nhé.",
        },
      ],
      tags: ["daily-routine", "hygiene"],
    },
    {
      word: "schedule",
      pronunciation: "/ˈʃedjuːl/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "a plan of activities or events and when they will happen",
          meaningVi: "lịch trình, thời gian biểu",
          example: "I have a busy schedule today.",
          exampleVi: "Hôm nay tôi có lịch trình bận rộn.",
        },
      ],
      tags: ["daily-routine", "planning"],
    },
    {
      word: "lunch",
      pronunciation: "/lʌntʃ/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "a meal eaten in the middle of the day",
          meaningVi: "bữa trưa",
          example: "What did you have for lunch?",
          exampleVi: "Bạn đã ăn gì vào bữa trưa?",
        },
      ],
      tags: ["daily-routine", "food"],
    },
    {
      word: "dinner",
      pronunciation: "/ˈdɪnər/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "the main meal of the day, usually eaten in the evening",
          meaningVi: "bữa tối",
          example: "We have dinner at 7 PM.",
          exampleVi: "Chúng tôi ăn tối lúc 7 giờ.",
        },
      ],
      tags: ["daily-routine", "food"],
    },
    {
      word: "bedtime",
      pronunciation: "/ˈbedtaɪm/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "the time when you normally go to bed",
          meaningVi: "giờ đi ngủ",
          example: "My bedtime is usually 11 PM.",
          exampleVi: "Giờ đi ngủ của tôi thường là 11 giờ đêm.",
        },
      ],
      tags: ["daily-routine", "sleep"],
    },
    {
      word: "alarm",
      pronunciation: "/əˈlɑːrm/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "a device that makes a loud noise to wake you up",
          meaningVi: "đồng hồ báo thức",
          example: "I set my alarm for 6 AM.",
          exampleVi: "Tôi đặt báo thức lúc 6 giờ sáng.",
        },
      ],
      tags: ["daily-routine", "device"],
    },
    {
      word: "chore",
      pronunciation: "/tʃɔːr/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "a routine task, especially a household one",
          meaningVi: "việc nhà, công việc thường ngày",
          example: "I do household chores on weekends.",
          exampleVi: "Tôi làm việc nhà vào cuối tuần.",
        },
      ],
      tags: ["daily-routine", "household"],
    },
    {
      word: "exercise",
      pronunciation: "/ˈeksərsaɪz/",
      partOfSpeech: "verb",
      level: "beginner",
      definitions: [
        {
          meaningEn: "to do physical activities to stay healthy",
          meaningVi: "tập thể dục",
          example: "I exercise for 30 minutes every day.",
          exampleVi: "Tôi tập thể dục 30 phút mỗi ngày.",
        },
      ],
      tags: ["daily-routine", "health"],
    },
    {
      word: "nap",
      pronunciation: "/næp/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "a short sleep, especially during the day",
          meaningVi: "giấc ngủ trưa",
          example: "I take a nap after lunch.",
          exampleVi: "Tôi ngủ trưa sau bữa trưa.",
        },
      ],
      tags: ["daily-routine", "rest"],
    },
    {
      word: "habit",
      pronunciation: "/ˈhæbɪt/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "something you do regularly, often without thinking",
          meaningVi: "thói quen",
          example: "Reading before bed is a good habit.",
          exampleVi: "Đọc sách trước khi ngủ là một thói quen tốt.",
        },
      ],
      tags: ["daily-routine", "behavior"],
    },
  ],
  grammar: {
    topic: "Present Simple Tense",
    explanation:
      "The Present Simple tense is used to describe habits, routines, and general facts. Form: Subject + base verb (add 's' for he/she/it). Example: I wake up at 7 AM. She wakes up at 6 AM.",
    explanationVi:
      "Thì hiện tại đơn được dùng để mô tả thói quen, công việc hàng ngày và sự thật chung. Cấu trúc: Chủ ngữ + động từ nguyên mẫu (thêm 's' cho he/she/it). Ví dụ: Tôi thức dậy lúc 7 giờ sáng. Cô ấy thức dậy lúc 6 giờ sáng.",
    examples: [
      {
        sentence: "I wake up at 7 AM every day.",
        translation: "Tôi thức dậy lúc 7 giờ sáng mỗi ngày.",
      },
      {
        sentence: "She brushes her teeth twice a day.",
        translation: "Cô ấy đánh răng hai lần một ngày.",
      },
      {
        sentence: "We have dinner together as a family.",
        translation: "Chúng tôi ăn tối cùng nhau như một gia đình.",
      },
    ],
  },
};

// TOPIC 2: Shopping & Money
const topic2_shopping = {
  name: "Shopping & Money",
  level: "beginner",
  skill: "speaking",
  words: [
    {
      word: "purchase",
      pronunciation: "/ˈpɜːrtʃəs/",
      partOfSpeech: "verb",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "to buy something",
          meaningVi: "mua",
          example: "I'd like to purchase this shirt.",
          exampleVi: "Tôi muốn mua chiếc áo này.",
        },
      ],
      tags: ["shopping", "transaction"],
    },
    {
      word: "receipt",
      pronunciation: "/rɪˈsiːt/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "a piece of paper showing you paid for something",
          meaningVi: "hóa đơn, biên lai",
          example: "Keep your receipt in case you need to return it.",
          exampleVi: "Giữ hóa đơn để phòng trường hợp bạn cần trả lại.",
        },
      ],
      tags: ["shopping", "document"],
    },
    {
      word: "discount",
      pronunciation: "/ˈdɪskaʊnt/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "a reduction in price",
          meaningVi: "giảm giá",
          example: "There's a 20% discount on all items.",
          exampleVi: "Tất cả sản phẩm đều giảm giá 20%.",
        },
      ],
      tags: ["shopping", "price"],
    },
    {
      word: "refund",
      pronunciation: "/ˈriːfʌnd/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "money returned to you when you return a product",
          meaningVi: "hoàn tiền",
          example: "Can I get a refund for this defective item?",
          exampleVi: "Tôi có thể được hoàn tiền cho món hàng lỗi này không?",
        },
      ],
      tags: ["shopping", "return"],
    },
    {
      word: "budget",
      pronunciation: "/ˈbʌdʒɪt/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "an amount of money you plan to spend",
          meaningVi: "ngân sách",
          example: "I'm on a tight budget this month.",
          exampleVi: "Tháng này tôi có ngân sách eo hẹp.",
        },
      ],
      tags: ["shopping", "finance"],
    },
    {
      word: "bargain",
      pronunciation: "/ˈbɑːrɡən/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "something bought for less than usual price",
          meaningVi: "món hời, giá rẻ",
          example: "This dress was a real bargain!",
          exampleVi: "Chiếc váy này thực sự là món hời!",
        },
      ],
      tags: ["shopping", "value"],
    },
    {
      word: "cashier",
      pronunciation: "/kæˈʃɪr/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "a person who handles payments in a store",
          meaningVi: "thu ngân",
          example: "Please pay at the cashier.",
          exampleVi: "Vui lòng thanh toán tại quầy thu ngân.",
        },
      ],
      tags: ["shopping", "people"],
    },
    {
      word: "payment",
      pronunciation: "/ˈpeɪmənt/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "the act of paying money for something",
          meaningVi: "thanh toán",
          example: "We accept cash and card payments.",
          exampleVi: "Chúng tôi chấp nhận thanh toán bằng tiền mặt và thẻ.",
        },
      ],
      tags: ["shopping", "transaction"],
    },
    {
      word: "expensive",
      pronunciation: "/ɪkˈspensɪv/",
      partOfSpeech: "adjective",
      level: "beginner",
      definitions: [
        {
          meaningEn: "costing a lot of money",
          meaningVi: "đắt",
          example: "This watch is too expensive.",
          exampleVi: "Chiếc đồng hồ này quá đắt.",
        },
      ],
      tags: ["shopping", "price"],
    },
    {
      word: "affordable",
      pronunciation: "/əˈfɔːrdəbl/",
      partOfSpeech: "adjective",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "not too expensive; able to be afforded",
          meaningVi: "có giá phải chăng",
          example: "This restaurant has affordable prices.",
          exampleVi: "Nhà hàng này có giá cả phải chăng.",
        },
      ],
      tags: ["shopping", "price"],
    },
    {
      word: "checkout",
      pronunciation: "/ˈtʃekaʊt/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "the place where you pay in a store",
          meaningVi: "quầy thanh toán",
          example: "Please proceed to the checkout.",
          exampleVi: "Vui lòng đến quầy thanh toán.",
        },
      ],
      tags: ["shopping", "location"],
    },
    {
      word: "currency",
      pronunciation: "/ˈkɜːrənsi/",
      partOfSpeech: "noun",
      level: "intermediate",
      definitions: [
        {
          meaningEn: "the money used in a particular country",
          meaningVi: "tiền tệ",
          example: "What currency do you accept?",
          exampleVi: "Bạn chấp nhận tiền tệ nào?",
        },
      ],
      tags: ["shopping", "money"],
    },
    {
      word: "wallet",
      pronunciation: "/ˈwɑːlɪt/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "a small flat case for carrying money and cards",
          meaningVi: "ví tiền",
          example: "I left my wallet at home.",
          exampleVi: "Tôi để quên ví ở nhà.",
        },
      ],
      tags: ["shopping", "accessory"],
    },
    {
      word: "sale",
      pronunciation: "/seɪl/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "a period when stores sell things at reduced prices",
          meaningVi: "đợt giảm giá",
          example: "There's a big sale this weekend.",
          exampleVi: "Cuối tuần này có đợt giảm giá lớn.",
        },
      ],
      tags: ["shopping", "event"],
    },
    {
      word: "credit card",
      pronunciation: "/ˈkredɪt kɑːrd/",
      partOfSpeech: "noun",
      level: "beginner",
      definitions: [
        {
          meaningEn: "a plastic card used to buy things on credit",
          meaningVi: "thẻ tín dụng",
          example: "Can I pay by credit card?",
          exampleVi: "Tôi có thể trả bằng thẻ tín dụng không?",
        },
      ],
      tags: ["shopping", "payment-method"],
    },
  ],
  grammar: {
    topic: "Modal Verbs (can, could, may)",
    explanation:
      "Modal verbs are used to express ability, permission, and requests. 'Can' for ability and informal requests, 'Could' for polite requests, 'May' for formal permission. Example: Can I help you? Could you show me that? May I try this on?",
    explanationVi:
      "Động từ khuyết thiếu dùng để diễn tả khả năng, sự cho phép và yêu cầu. 'Can' cho khả năng và yêu cầu thân mật, 'Could' cho yêu cầu lịch sự, 'May' cho sự cho phép trang trọng.",
    examples: [
      {
        sentence: "Can I pay by credit card?",
        translation: "Tôi có thể trả bằng thẻ tín dụng không?",
      },
      {
        sentence: "Could you give me a discount?",
        translation: "Bạn có thể giảm giá cho tôi không?",
      },
      {
        sentence: "May I see the receipt?",
        translation: "Tôi có thể xem hóa đơn được không?",
      },
    ],
  },
};

// Helper function to create seed data for one topic
async function seedTopic(topicData, categoryId, userId) {
  const Word = require("../Word");
  const CardDeck = require("../CardDeck");
  const FlashCard = require("../FlashCard");
  const ContentBlock = require("../ContentBlock");
  const Lesson = require("../Lesson");
  const Quiz = require("../Quiz");

  const results = {
    topic: topicData.name,
    words: [],
    cardDeck: null,
    flashcards: [],
    blocks: [],
    lesson: null,
    quiz: null,
  };

  // 1. Create Words
  const createdWords = [];
  for (const wordData of topicData.words) {
    const word = await Word.create({
      ...wordData,
      createdBy: userId,
      status: STATUS.ACTIVE,
    });
    createdWords.push(word);
  }
  results.words = createdWords;

  // 2. Create Card Deck
  const cardDeck = await CardDeck.create({
    title: `${topicData.name} - Vocabulary Deck`,
    description: `Learn essential vocabulary for ${topicData.name.toLowerCase()}`,
    level: topicData.level,
    difficulty: topicData.level === "beginner" ? "easy" : "medium",
    categoryId: categoryId,
    status: STATUS.ACTIVE,
    createdBy: userId,
    cardCount: createdWords.length,
  });
  results.cardDeck = cardDeck;

  // 3. Create Flashcards
  const createdFlashcards = [];
  for (const word of createdWords) {
    const flashcard = await FlashCard.create({
      word: word._id,
      frontText: word.word,
      backText: word.definitions[0].meaningVi,
      cardDeck: cardDeck._id,
      difficulty: topicData.level === "beginner" ? "easy" : "medium",
      tags: word.tags,
      status: STATUS.ACTIVE,
      createdBy: userId,
    });
    createdFlashcards.push(flashcard);
  }
  results.flashcards = createdFlashcards;

  // 4. Create Lesson (will add blocks later)
  const lesson = await Lesson.create({
    title: topicData.name,
    description: `Master ${topicData.name.toLowerCase()} with grammar, vocabulary, and practical exercises`,
    topic: topicData.name,
    skill: topicData.skill,
    level: topicData.level,
    categoryId: categoryId,
    duration_minutes: 45,
    status: STATUS.ACTIVE,
    createdBy: userId,
    blocks: [], // Will update later
  });
  results.lesson = lesson;

  // 5. Create Blocks
  const blocks = [];

  // Grammar Block
  const grammarBlock = await ContentBlock.create({
    type: "grammar",
    title: `${topicData.grammar.topic} - ${topicData.name}`,
    description: topicData.grammar.explanation,
    skill: topicData.skill,
    difficulty: topicData.level,
    lessonId: lesson._id,
    topic: topicData.grammar.topic,
    explanation: topicData.grammar.explanation,
    explanationVi: topicData.grammar.explanationVi,
    examples: topicData.grammar.examples.map((ex) => ({
      sentence: ex.sentence,
      translation: ex.translation,
      explanation: "",
    })),
    status: STATUS.ACTIVE,
    order: 1,
  });
  blocks.push(grammarBlock);

  // Vocabulary Block
  const vocabularyBlock = await ContentBlock.create({
    type: "vocabulary",
    title: `${topicData.name} - Vocabulary Practice`,
    description: `Practice essential vocabulary for ${topicData.name.toLowerCase()}`,
    skill: topicData.skill,
    difficulty: topicData.level,
    lessonId: lesson._id,
    cardDeck: cardDeck._id,
    status: STATUS.ACTIVE,
    order: 2,
  });
  blocks.push(vocabularyBlock);

  // Media Block (placeholder - you can add real videos later)
  const mediaBlock = await ContentBlock.create({
    type: "media",
    title: `${topicData.name} - Video Lesson`,
    description: `Watch and learn about ${topicData.name.toLowerCase()}`,
    skill: "listening",
    difficulty: topicData.level,
    lessonId: lesson._id,
    mediaType: "video",
    sourceType: "youtube",
    sourceUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    status: STATUS.ACTIVE,
    order: 3,
  });
  blocks.push(mediaBlock);

  results.blocks = blocks;

  // 6. Update Lesson with Blocks
  lesson.blocks = blocks.map((block, index) => ({
    block: block._id,
    order: index + 1,
  }));
  await lesson.save();

  // 7. Create Quiz
  const quizQuestions = createdWords.slice(0, 5).map((word, index) => ({
    type: "multiple_choice",
    questionText: `What does "${word.word}" mean?`,
    options: [
      { text: word.definitions[0].meaningVi, isCorrect: true },
      { text: "Incorrect option 1", isCorrect: false },
      { text: "Incorrect option 2", isCorrect: false },
      { text: "Incorrect option 3", isCorrect: false },
    ],
    correctAnswer: word.definitions[0].meaningVi,
    explanation: `"${word.word}" means "${word.definitions[0].meaningVi}"`,
    points: 10,
    tags: word.tags,
  }));

  const quiz = await Quiz.create({
    title: `${topicData.name} - Quiz`,
    skill: topicData.skill,
    difficulty: topicData.level,
    xpReward: 50,
    attachedTo: {
      kind: "Lesson",
      item: lesson._id,
    },
    questions: quizQuestions,
    status: STATUS.ACTIVE,
  });
  results.quiz = quiz;

  return results;
}

module.exports = {
  topic1_dailyRoutines,
  topic2_shopping,
  seedTopic,
};
