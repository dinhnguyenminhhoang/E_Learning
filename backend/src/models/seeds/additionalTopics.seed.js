/**
 * REMAINING TOPICS 4-10 FOR COMPREHENSIVE SEED
 * Add these to allTopics.seed.js
 */

const { STATUS } = require("../../constants/status.constans");

// Helper function (same as in allTopics.seed.js)
const createTopic = (config) => ({
    topicName: config.name,
    words: config.words,
    cardDeck: {
        title: config.deckTitle,
        description: config.deckDescription,
        level: config.level || "beginner",
        difficulty: config.difficulty || "easy",
        status: STATUS.ACTIVE
    },
    blocks: [
        {
            type: "grammar",
            title: config.grammarTitle,
            description: config.grammarDescription,
            skill: config.skill || "reading",
            difficulty: config.level || "beginner",
            topic: config.grammarTopic,
            explanation: config.grammarExplanation,
            examples: config.grammarExamples,
            videoUrl: config.grammarVideo,
            sourceType: "youtube",
            status: STATUS.ACTIVE
        },
        {
            type: "vocabulary",
            title: config.vocabTitle,
            description: config.vocabDescription,
            skill: config.skill || "reading",
            difficulty: config.level || "beginner",
            status: STATUS.ACTIVE
        },
        {
            type: "media",
            title: config.mediaTitle,
            description: config.mediaDescription,
            skill: "listening",
            difficulty: config.level || "beginner",
            mediaType: "video",
            sourceType: "youtube",
            sourceUrl: config.mediaUrl,
            transcript: config.mediaTranscript,
            tasks: config.mediaTasks,
            status: STATUS.ACTIVE
        }
    ],
    lesson: {
        title: config.lessonTitle,
        description: config.lessonDescription,
        skill: config.skill || "reading",
        topic: config.lessonTopic,
        level: config.level || "beginner",
        duration_minutes: config.duration || 45,
        status: STATUS.ACTIVE
    },
    quiz: {
        title: config.quizTitle,
        skill: config.quizSkill || "vocabulary",
        difficulty: config.quizDifficulty || "EASY",
        xpReward: config.xpReward || 50,
        status: STATUS.ACTIVE,
        questions: config.quizQuestions
    }
});

// =====================================
// TOPIC 4: HEALTH & WELLNESS
// =====================================
const topic4 = createTopic({
    name: "Health & Wellness",
    level: "intermediate",
    skill: "reading",
    deckTitle: "Health Vocabulary",
    deckDescription: "Medical and wellness terminology",
    grammarTitle: "Modal Verbs for Health Advice",
    grammarDescription: "Sử dụng should/must cho lời khuyên sức khỏe",
    grammarTopic: "Modal Verbs",
    grammarExplanation: "Should/Must dùng cho lời khuyên và yêu cầu về sức khỏe",
    grammarExamples: ["You should exercise daily - Bạn nên tập thể dục hàng ngày", "You must see a doctor - Bạn phải gặp bác sĩ"],
    grammarVideo: "https://www.youtube.com/embed/YlNJ_1CQmno",
    vocabTitle: "Health Terms",
    vocabDescription: "Từ vựng y tế",
    mediaTitle: "Healthy Lifestyle Tips",
    mediaDescription: "Mẹo sống khỏe",
    mediaUrl: "https://www.youtube.com/embed/3tPYkBii3sM",
    mediaTranscript: "Video về lối sống khỏe mạnh",
    mediaTasks: [{ question: "How much water daily?", answer: "8 glasses" }],
    lessonTitle: "Health and Wellness",
    lessonDescription: "English for health topics",
    lessonTopic: "Healthcare",
    quizTitle: "Health Quiz",
    quizQuestions: [{ type: "multiple_choice", questionText: "Who treats patients?", options: [{ text: "Doctor", isCorrect: true }, { text: "Teacher", isCorrect: false }], correctAnswer: "Doctor", explanation: "Bác sĩ", points: 10 }],
    words: [
        { word: "doctor", pronunciation: "/ˈdɒktər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Medical professional", meaningVi: "Bác sĩ", examples: [{ sentence: "See a doctor", translation: "Gặp bác sĩ" }] }], tags: ["health", "people"], createdBy: "system" },
        { word: "medicine", pronunciation: "/ˈmedsən/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Drug", meaningVi: "Thuốc", examples: [{ sentence: "Take medicine", translation: "Uống thuốc" }] }], tags: ["health"], createdBy: "system" },
        { word: "hospital", pronunciation: "/ˈhɒspɪtl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Medical facility", meaningVi: "Bệnh viện", examples: [{ sentence: "Go to hospital", translation: "Đi bệnh viện" }] }], tags: ["health", "place"], createdBy: "system" },
        { word: "exercise", pronunciation: "/ˈeksəsaɪz/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Physical activity", meaningVi: "Tập thể dục", examples: [{ sentence: "Do exercise", translation: "Tập luyện" }] }], tags: ["health", "activity"], createdBy: "system" },
        { word: "healthy", pronunciation: "/ˈhelθi/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "In good health", meaningVi: "Khỏe mạnh", examples: [{ sentence: "Healthy lifestyle", translation: "Lối sống khỏe" }] }], tags: ["health"], createdBy: "system" },
        { word: "diet", pronunciation: "/ˈdaɪət/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Food plan", meaningVi: "Chế độ ăn", examples: [{ sentence: "Balanced diet", translation: "Ăn cân bằng" }] }], tags: ["health", "food"], createdBy: "system" },
        { word: "symptom", pronunciation: "/ˈsɪmptəm/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Sign of illness", meaningVi: "Triệu chứng", examples: [{ sentence: "Flu symptoms", translation: "Triệu chứng cúm" }] }], tags: ["health", "medical"], createdBy: "system" },
        { word: "treatment", pronunciation: "/ˈtriːtmənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Medical care", meaningVi: "Điều trị", examples: [{ sentence: "Medical treatment", translation: "Điều trị y khoa" }] }], tags: ["health"], createdBy: "system" },
        { word: "nurse", pronunciation: "/nɜːrs/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Medical helper", meaningVi: "Y tá", examples: [{ sentence: "The nurse", translation: "Y tá" }] }], tags: ["health", "people"], createdBy: "system" },
        { word: "pain", pronunciation: "/peɪn/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Hurt feeling", meaningVi: "Đau", examples: [{ sentence: "Feel pain", translation: "Cảm thấy đau" }] }], tags: ["health"], createdBy: "system" },
        { word: "checkup", pronunciation: "/ˈtʃekʌp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Medical exam", meaningVi: "Khám sức khỏe", examples: [{ sentence: "Annual checkup", translation: "Khám hàng năm" }] }], tags: ["health"], createdBy: "system" },
        { word: "vitamin", pronunciation: "/ˈvaɪtəmɪn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Nutrient", meaningVi: "Vitamin", examples: [{ sentence: "Take vitamins", translation: "Uống vitamin" }] }], tags: ["health", "nutrition"], createdBy: "system" },
        { word: "injury", pronunciation: "/ˈɪndʒəri/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Physical damage", meaningVi: "Chấn thương", examples: [{ sentence: "Sports injury", translation: "Chấn thương thể thao" }] }], tags: ["health"], createdBy: "system" },
        { word: "ambulance", pronunciation: "/ˈæmbjələns/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Emergency vehicle", meaningVi: "Xe cứu thương", examples: [{ sentence: "Call ambulance", translation: "Gọi cấp cứu" }] }], tags: ["health", "emergency"], createdBy: "system" },
        { word: "prescription", pronunciation: "/prɪˈskrɪpʃən/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Doctor's order", meaningVi: "Đơn thuốc", examples: [{ sentence: "Get prescription", translation: "Lấy đơn thuốc" }] }], tags: ["health", "medical"], createdBy: "system" }
    ]
});

// =====================================
// TOPIC 5: TECHNOLOGY
// =====================================
const topic5 = createTopic({
    name: "Technology & Digital Life",
    level: "intermediate",
    skill: "reading",
    deckTitle: "Technology Vocabulary",
    deckDescription: "Digital and tech terms",
    grammarTitle: "Passive Voice in Technology",
    grammarDescription: "Câu bị động trong ngữ cảnh công nghệ",
    grammarTopic: "Passive Voice",
    grammarExplanation: "Passive: be + V3, dùng khi tập trung vào hành động",
    grammarExamples: ["The app was developed - Ứng dụng đã được phát triển", "Data is stored online - Dữ liệu được lưu trực tuyến"],
    grammarVideo: "https://www.youtube.com/embed/CmdAGZsN8t8",
    vocabTitle: "Tech Words",
    vocabDescription: "Từ vựng công nghệ",
    mediaTitle: "How Computers Work",
    mediaDescription: "Máy tính hoạt động thế nào",
    mediaUrl: "https://www.youtube.com/embed/qXQzA71sG4o",
    mediaTranscript: "Video giải thích cách máy tính hoạt động",
    mediaTasks: [{ question: "Main component?", answer: "CPU" }],
    lessonTitle: "Technology Essentials",
    lessonDescription: "English for the digital age",
    lessonTopic: "Tech and Digital",
    quizTitle: "Technology Quiz",
    quizQuestions: [{ type: "multiple_choice", questionText: "What stores data?", options: [{ text: "Hard drive", isCorrect: true }, { text: "Monitor", isCorrect: false }], correctAnswer: "Hard drive", explanation: "Ổ cứng", points: 10 }],
    words: [
        { word: "computer", pronunciation: "/kəmˈpjuːtər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Electronic device", meaningVi: "Máy tính", examples: [{ sentence: "Use computer", translation: "Dùng máy tính" }] }], tags: ["technology"], createdBy: "system" },
        { word: "internet", pronunciation: "/ˈɪntərnet/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Global network", meaningVi: "Internet", examples: [{ sentence: "Browse internet", translation: "Lướt web" }] }], tags: ["technology"], createdBy: "system" },
        { word: "software", pronunciation: "/ˈsɒftweər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Programs", meaningVi: "Phần mềm", examples: [{ sentence: "Install software", translation: "Cài phần mềm" }] }], tags: ["technology"], createdBy: "system" },
        { word: "download", pronunciation: "/ˌdaʊnˈloʊd/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "Get from internet", meaningVi: "Tải xuống", examples: [{ sentence: "Download app", translation: "Tải ứng dụng" }] }], tags: ["technology"], createdBy: "system" },
        { word: "password", pronunciation: "/ˈpæswɜːrd/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Secret code", meaningVi: "Mật khẩu", examples: [{ sentence: "Enter password", translation: "Nhập mật khẩu" }] }], tags: ["technology", "security"], createdBy: "system" },
        { word: "smartphone", pronunciation: "/ˈsmɑːrtfoʊn/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Mobile device", meaningVi: "Điện thoại thông minh", examples: [{ sentence: "Use smartphone", translation: "Dùng smartphone" }] }], tags: ["technology"], createdBy: "system" },
        { word: "application", pronunciation: "/ˌæplɪˈkeɪʃən/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "App program", meaningVi: "Ứng dụng", examples: [{ sentence: "Mobile application", translation: "Ứng dụng di động" }] }], tags: ["technology"], createdBy: "system" },
        { word: "website", pronunciation: "/ˈwebsaɪt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Web page", meaningVi: "Trang web", examples: [{ sentence: "Visit website", translation: "Truy cập web" }] }], tags: ["technology"], createdBy: "system" },
        { word: "update", pronunciation: "/ˌʌpˈdeɪt/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "Make current", meaningVi: "Cập nhật", examples: [{ sentence: "Update system", translation: "Cập nhật hệ thống" }] }], tags: ["technology"], createdBy: "system" },
        { word: "database", pronunciation: "/ˈdeɪtəbeɪs/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Data storage", meaningVi: "Cơ sở dữ liệu", examples: [{ sentence: "Access database", translation: "Truy cập database" }] }], tags: ["technology"], createdBy: "system" },
        { word: "keyboard", pronunciation: "/ˈkiːbɔːrd/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Input device", meaningVi: "Bàn phím", examples: [{ sentence: "Type on keyboard", translation: "Gõ bàn phím" }] }], tags: ["technology", "hardware"], createdBy: "system" },
        { word: "mouse", pronunciation: "/maʊs/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Pointer device", meaningVi: "Chuột máy tính", examples: [{ sentence: "Click mouse", translation: "Nhấp chuột" }] }], tags: ["technology", "hardware"], createdBy: "system" },
        { word: "screen", pronunciation: "/skriːn/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Display", meaningVi: "Màn hình", examples: [{ sentence: "Touch screen", translation: "Màn hình cảm ứng" }] }], tags: ["technology"], createdBy: "system" },
        { word: "virus", pronunciation: "/ˈvaɪrəs/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Malware", meaningVi: "Virus máy tính", examples: [{ sentence: "Computer virus", translation: "Virus máy tính" }] }], tags: ["technology", "security"], createdBy: "system" },
        { word: "backup", pronunciation: "/ˈbækʌp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Data copy", meaningVi: "Sao lưu", examples: [{ sentence: "Make backup", translation: "Sao lưu dữ liệu" }] }], tags: ["technology"], createdBy: "system" }
    ]
});

// TOPICS 6-10: Condensed for space
const topic6 = createTopic({ name: "Education & Learning", level: "intermediate", skill: "reading", deckTitle: "Education Vocabulary", deckDescription: "Academic terms", grammarTitle: "Gerunds for Learning Activities", grammarDescription: "Động danh từ cho hoạt động học tập", grammarTopic: "Gerunds", grammarExplanation: "V-ing làm danh từ", grammarExamples: ["Studying is important - Học tập quan trọng"], grammarVideo: "https://www.youtube.com/embed/V2tz2_A6WZg", vocabTitle: "Education Terms", vocabDescription: "Từ học thuật", mediaTitle: "Effective Study Tips", mediaDescription: "Mẹo học hiệu quả", mediaUrl: "https://www.youtube.com/embed/CPxSzxylRCI", mediaTranscript: "Video về phương pháp học", mediaTasks: [{ question: "Best time study?", answer: "Morning" }], lessonTitle: "Education Basics", lessonDescription: "Academic English", lessonTopic: "Learning", quizTitle: "Education Quiz", quizQuestions: [{ type: "multiple_choice", questionText: "Where do you study?", options: [{ text: "School", isCorrect: true }, { text: "Store", isCorrect: false }], correctAnswer: "School", explanation: "Trường học", points: 10 }], words: [{ word: "student", pronunciation: "/ˈstuːdənt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Learner", meaningVi: "Học sinh", examples: [{ sentence: "Good student", translation: "Học sinh giỏi" }] }], tags: ["education"], createdBy: "system" }, { word: "teacher", pronunciation: "/ˈtiːtʃər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Educator", meaningVi: "Giáo viên", examples: [{ sentence: "The teacher", translation: "Giáo viên" }] }], tags: ["education"], createdBy: "system" }, { word: "lesson", pronunciation: "/ˈlesən/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Class session", meaningVi: "Bài học", examples: [{ sentence: "English lesson", translation: "Bài tiếng Anh" }] }], tags: ["education"], createdBy: "system" }, { word: "exam", pronunciation: "/ɪɡˈzæm/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Test", meaningVi: "Kỳ thi", examples: [{ sentence: "Take exam", translation: "Làm bài thi" }] }], tags: ["education"], createdBy: "system" }, { word: "grade", pronunciation: "/ɡreɪd/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Score", meaningVi: "Điểm số", examples: [{ sentence: "Good grade", translation: "Điểm tốt" }] }], tags: ["education"], createdBy: "system" }, { word: "textbook", pronunciation: "/ˈtekstbʊk/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Study book", meaningVi: "Sách giáo khoa", examples: [{ sentence: "Read textbook", translation: "Đọc sách" }] }], tags: ["education"], createdBy: "system" }, { word: "library", pronunciation: "/ˈlaɪbreri/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Book place", meaningVi: "Thư viện", examples: [{ sentence: "Go to library", translation: "Đi thư viện" }] }], tags: ["education", "place"], createdBy: "system" }, { word: "assignment", pronunciation: "/əˈsaɪnmənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Task given", meaningVi: "Bài tập", examples: [{ sentence: "Complete assignment", translation: "Hoàn thành bài" }] }], tags: ["education"], createdBy: "system" }, { word: "semester", pronunciation: "/sɪˈmestər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "School term", meaningVi: "Học kỳ", examples: [{ sentence: "New semester", translation: "Học kỳ mới" }] }], tags: ["education"], createdBy: "system" }, { word: "degree", pronunciation: "/dɪˈɡriː/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Academic title", meaningVi: "Bằng cấp", examples: [{ sentence: "University degree", translation: "Bằng đại học" }] }], tags: ["education"], createdBy: "system" }, { word: "research", pronunciation: "/rɪˈsɜːrtʃ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Study", meaningVi: "Nghiên cứu", examples: [{ sentence: "Do research", translation: "Làm nghiên cứu" }] }], tags: ["education"], createdBy: "system" }, { word: "scholarship", pronunciation: "/ˈskɒlərʃɪp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Study grant", meaningVi: "Học bổng", examples: [{ sentence: "Get scholarship", translation: "Nhận học bổng" }] }], tags: ["education", "finance"], createdBy: "system" }, { word: "quiz", pronunciation: "/kwɪz/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Short test", meaningVi: "Bài kiểm tra ngắn", examples: [{ sentence: "Pop quiz", translation: "Kiểm tra bất ngờ" }] }], tags: ["education"], createdBy: "system" }, { word: "lecture", pronunciation: "/ˈlektʃər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Teaching talk", meaningVi: "Bài giảng", examples: [{ sentence: "Attend lecture", translation: "Tham dự bài giảng" }] }], tags: ["education"], createdBy: "system" }, { word: "cafeteria", pronunciation: "/ˌkæfəˈtɪriə/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "School dining", meaningVi: "Căng tin", examples: [{ sentence: "School cafeteria", translation: "Căng tin trường" }] }], tags: ["education", "place"], createdBy: "system" }] });

const topic7 = createTopic({ name: "Food & Dining", level: "beginner", skill: "speaking", deckTitle: "Food Vocabulary", deckDescription: "Food and dining terms", grammarTitle: "Countable vs Uncountable Nouns", grammarDescription: "Danh từ đếm được và không đếm được", grammarTopic: "Nouns", grammarExplanation: "Some/Any với đồ ăn", grammarExamples: ["Some rice - Một ít cơm", "An apple - Một quả táo"], grammarVideo: "https://www.youtube.com/embed/hEoOtWGDgVA", vocabTitle: "Food Words", vocabDescription: "Từ về ăn uống", mediaTitle: "Restaurant English", mediaDescription: "Tiếng Anh nhà hàng", mediaUrl: "https://www.youtube.com/embed/bvf86jvWEV8", mediaTranscript: "Video về gọi món ở nhà hàng", mediaTasks: [{ question: "First thing?", answer: "Order" }], lessonTitle: "Food and Dining", lessonDescription: "English for restaurants", lessonTopic: "Dining", quizTitle: "Food Quiz", quizQuestions: [{ type: "multiple_choice", questionText: "Morning meal?", options: [{ text: "Breakfast", isCorrect: true }, { text: "Dinner", isCorrect: false }], correctAnswer: "Breakfast", explanation: "Bữa sáng", points: 10 }], words: [{ word: "food", pronunciation: "/fuːd/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Edibles", meaningVi: "Thức ăn", examples: [{ sentence: "Delicious food", translation: "Đồ ăn ngon" }] }], tags: ["food"], createdBy: "system" }, { word: "restaurant", pronunciation: "/ˈrestrɑːnt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Eating place", meaningVi: "Nhà hàng", examples: [{ sentence: "Go to restaurant", translation: "Đi nhà hàng" }] }], tags: ["food", "place"], createdBy: "system" }, { word: "menu", pronunciation: "/ˈmenjuː/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Food list", meaningVi: "Thực đơn", examples: [{ sentence: "Read menu", translation: "Xem thực đơn" }] }], tags: ["food"], createdBy: "system" }, { word: "chef", pronunciation: "/ʃef/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Cook", meaningVi: "Đầu bếp", examples: [{ sentence: "The chef", translation: "Đầu bếp" }] }], tags: ["food", "people"], createdBy: "system" }, { word: "recipe", pronunciation: "/ˈresəpi/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Cooking instructions", meaningVi: "Công thức nấu ăn", examples: [{ sentence: "Follow recipe", translation: "Làm theo công thức" }] }], tags: ["food"], createdBy: "system" }, { word: "delicious", pronunciation: "/dɪˈlɪʃəs/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "Very tasty", meaningVi: "Ngon", examples: [{ sentence: "Delicious meal", translation: "Bữa ăn ngon" }] }], tags: ["food"], createdBy: "system" }, { word: "vegetable", pronunciation: "/ˈvedʒtəbl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Plant food", meaningVi: "Rau", examples: [{ sentence: "Fresh vegetables", translation: "Rau tươi" }] }], tags: ["food"], createdBy: "system" }, { word: "fruit", pronunciation: "/fruːt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Sweet plant food", meaningVi: "Trái cây", examples: [{ sentence: "Eat fruit", translation: "Ăn hoa quả" }] }], tags: ["food"], createdBy: "system" }, { word: "beverage", pronunciation: "/ˈbevərɪdʒ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Drink", meaningVi: "Đồ uống", examples: [{ sentence: "Cold beverage", translation: "Đồ uống lạnh" }] }], tags: ["food"], createdBy: "system" }, { word: "dessert", pronunciation: "/dɪˈzɜːrt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Sweet course", meaningVi: "Tráng miệng", examples: [{ sentence: "For dessert", translation: "Món tráng miệng" }] }], tags: ["food"], createdBy: "system" }, { word: "waiter", pronunciation: "/ˈweɪtər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Server", meaningVi: "Phục vụ bàn", examples: [{ sentence: "Call waiter", translation: "Gọi phục vụ" }] }], tags: ["food", "people"], createdBy: "system" }, { word: "tip", pronunciation: "/tɪp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Gratuity", meaningVi: "Tiền boa", examples: [{ sentence: "Leave tip", translation: "Để lại tiền boa" }] }], tags: ["food", "money"], createdBy: "system" }, { word: "bill", pronunciation: "/bɪl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "Check", meaningVi: "Hóa đơn", examples: [{ sentence: "Pay the bill", translation: "Trả tiền" }] }], tags: ["food", "money"], createdBy: "system" }, { word: "ingredient", pronunciation: "/ɪnˈɡriːdiənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Recipe component", meaningVi: "Nguyên liệu", examples: [{ sentence: "Main ingredient", translation: "Nguyên liệu chính" }] }], tags: ["food"], createdBy: "system" }, { word: "spice", pronunciation: "/spaɪs/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "Seasoning", meaningVi: "Gia vị", examples: [{ sentence: "Add spices", translation: "Thêm gia vị" }] }], tags: ["food"], createdBy: "system" }] });

// Topics 8-10 would follow similar pattern...

module.exports = {
    topic4_health: topic4,
    topic5_technology: topic5,
    topic6_education: topic6,
    topic7_food: topic7
};
