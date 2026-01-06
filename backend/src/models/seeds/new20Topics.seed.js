/**
 * NEXT 20 TOPICS (21-40) - Completely new topics
 * Topics 1-20 already in database, these are additional 20 topics
 */

const { STATUS } = require("../../constants/status.constans");

// Simplified helper
const createQuickTopic = (name, level, words) => ({
    topicName: name,
    words: words.map(w => ({
        word: w.word,
        pronunciation: w.pron || `/${w.word}/`,
        partOfSpeech: w.pos || "noun",
        level: level,
        definitions: [{
            meaning: w.meaning,
            meaningVi: w.vi,
            examples: [{ sentence: w.ex, translation: w.exVi }]
        }],
        tags: [name.toLowerCase().split(' ')[0]],
        createdBy: "system"
    })),
    cardDeck: {
        title: `${name} Vocabulary`,
        description: `Essential ${name.toLowerCase()} words`,
        level, difficulty: level === "beginner" ? "easy" : "medium",
        status: STATUS.ACTIVE
    },
    blocks: [
        { type: "grammar", title: `Grammar for ${name}`, description: `Ngữ pháp ${name}`, skill: "reading", difficulty: level, topic: "Mixed", explanation: "Các cấu trúc cơ bản", examples: ["Example 1", "Example 2"], videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", sourceType: "youtube", status: STATUS.ACTIVE },
        { type: "vocabulary", title: `${name} Words`, description: `Từ vựng ${name}`, skill: "reading", difficulty: level, status: STATUS.ACTIVE },
        { type: "media", title: `${name} Practice`, description: `Luyện tập ${name}`, skill: "listening", difficulty: level, mediaType: "video", sourceType: "youtube", sourceUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", transcript: "Practice video", tasks: [{ question: "Q1?", answer: "A1" }], status: STATUS.ACTIVE }
    ],
    lesson: {
        title: `Learn ${name}`,
        description: `Master ${name.toLowerCase()} vocabulary and usage`,
        skill: "reading", topic: name, level, duration_minutes: 30,
        status: STATUS.ACTIVE
    },
    quiz: {
        title: `${name} Quiz`,
        skill: "vocabulary", difficulty: "EASY", xpReward: 50,
        status: STATUS.ACTIVE,
        questions: [{
            type: "multiple_choice",
            questionText: `What is ${words[0].word}?`,
            options: [{ text: words[0].vi, isCorrect: true }, { text: "Wrong", isCorrect: false }],
            correctAnswer: words[0].vi,
            explanation: words[0].vi,
            points: 10
        }]
    }
});

// 20 NEW TOPICS (21-40)
const next20Topics = [
    createQuickTopic("Science & Research", "intermediate", [
        { word: "experiment", pron: "/ɪkˈsperɪmənt/", pos: "noun", meaning: "Scientific test", vi: "Thí nghiệm", ex: "Do experiment", exVi: "Làm thí nghiệm" },
        { word: "laboratory", pron: "/ˈlæbrətɔːri/", pos: "noun", meaning: "Research place", vi: "Phòng thí nghiệm", ex: "Work in lab", exVi: "Làm trong lab" },
        { word: "scientist", pron: "/ˈsaɪəntɪst/", pos: "noun", meaning: "Researcher", vi: "Nhà khoa học", ex: "Famous scientist", exVi: "Nhà KH nổi tiếng" },
        { word: "discovery", pron: "/dɪˈskʌvəri/", pos: "noun", meaning: "Finding", vi: "Khám phá", ex: "New discovery", exVi: "Phát hiện mới" },
        { word: "theory", pron: "/ˈθɪəri/", pos: "noun", meaning: "Hypothesis", vi: "Lý thuyết", ex: "Scientific theory", exVi: "Lý thuyết KH" },
        { word: "molecule", pron: "/ˈmɒlɪkjuːl/", pos: "noun", meaning: "Particle", vi: "Phân tử", ex: "Study molecules", exVi: "Nghiên cứu phân tử" },
        { word: "microscope", pron: "/ˈmaɪkrəskoʊp/", pos: "noun", meaning: "Magnifier", vi: "Kính hiển vi", ex: "Use microscope", exVi: "Dùng kính hiển vi" },
        { word: "formula", pron: "/ˈfɔːrmjələ/", pos: "noun", meaning: "Equation", vi: "Công thức", ex: "Chemical formula", exVi: "Công thức hóa học" },
        { word: "research", pron: "/rɪˈsɜːrtʃ/", pos: "noun", meaning: "Study", vi: "Nghiên cứu", ex: "Conduct research", exVi: "Tiến hành NC" },
        { word: "analysis", pron: "/əˈnæləsɪs/", pos: "noun", meaning: "Examination", vi: "Phân tích", ex: "Data analysis", exVi: "Phân tích dữ liệu" },
        { word: "hypothesis", pron: "/haɪˈpɒθəsɪs/", pos: "noun", meaning: "Assumption", vi: "Giả thuyết", ex: "Test hypothesis", exVi: "Kiểm tra giả thuyết" },
        { word: "observation", pron: "/ˌɒbzərˈveɪʃən/", pos: "noun", meaning: "Watching", vi: "Quan sát", ex: "Make observations", exVi: "Quan sát" },
        { word: "evidence", pron: "/ˈevɪdəns/", pos: "noun", meaning: "Proof", vi: "Bằng chứng", ex: "Scientific evidence", exVi: "Chứng cứ KH" },
        { word: "conclusion", pron: "/kənˈkluːʒən/", pos: "noun", meaning: "Result", vi: "Kết luận", ex: "Draw conclusion", exVi: "Rút ra kết luận" },
        { word: "variable", pron: "/ˈveəriəbl/", pos: "noun", meaning: "Factor", vi: "Biến số", ex: "Control variables", exVi: "Kiểm soát biến" }
    ]),

    createQuickTopic("Music & Instruments", "beginner", [
        { word: "music", pron: "/ˈmjuːzɪk/", pos: "noun", meaning: "Sound art", vi: "Âm nhạc", ex: "Listen music", exVi: "Nghe nhạc" },
        { word: "guitar", pron: "/ɡɪˈtɑːr/", pos: "noun", meaning: "String instrument", vi: "Đàn guitar", ex: "Play guitar", exVi: "Chơi guitar" },
        { word: "piano", pron: "/piˈænoʊ/", pos: "noun", meaning: "Keyboard instrument", vi: "Đàn piano", ex: "Learn piano", exVi: "Học piano" },
        { word: "drum", pron: "/drʌm/", pos: "noun", meaning: "Percussion", vi: "Trống", ex: "Beat drums", exVi: "Đánh trống" },
        { word: "violin", pron: "/ˌvaɪəˈlɪn/", pos: "noun", meaning: "String instrument", vi: "Đàn violin", ex: "Play violin", exVi: "Kéo violin" },
        { word: "trumpet", pron: "/ˈtrʌmpɪt/", pos: "noun", meaning: "Brass instrument", vi: "Kèn trumpet", ex: "Blow trumpet", exVi: "Thổi kèn" },
        { word: "melody", pron: "/ˈmelədi/", pos: "noun", meaning: "Tune", vi: "Giai điệu", ex: "Beautiful melody", exVi: "Giai điệu đẹp" },
        { word: "rhythm", pron: "/ˈrɪðəm/", pos: "noun", meaning: "Beat pattern", vi: "Nhịp điệu", ex: "Follow rhythm", exVi: "Theo nhịp" },
        { word: "harmony", pron: "/ˈhɑːrməni/", pos: "noun", meaning: "Chord blend", vi: "Hòa âm", ex: "Perfect harmony", exVi: "Hòa âm hoàn hảo" },
        { word: "orchestra", pron: "/ˈɔːrkɪstrə/", pos: "noun", meaning: "Music group", vi: "Dàn nhạc", ex: "Symphony orchestra", exVi: "Dàn giao hưởng" },
        { word: "composer", pron: "/kəmˈpoʊzər/", pos: "noun", meaning: "Music creator", vi: "Nhạc sĩ", ex: "Famous composer", exVi: "Nhạc sĩ nổi tiếng" },
        { word: "lyrics", pron: "/ˈlɪrɪks/", pos: "noun", meaning: "Song words", vi: "Lời bài hát", ex: "Write lyrics", exVi: "Viết lời" },
        { word: "concert", pron: "/ˈkɒnsərt/", pos: "noun", meaning: "Performance", vi: "Hòa nhạc", ex: "Attend concert", exVi: "Đi hòa nhạc" },
        { word: "band", pron: "/bænd/", pos: "noun", meaning: "Music group", vi: "Ban nhạc", ex: "Rock band", exVi: "Ban nhạc rock" },
        { word: "note", pron: "/noʊt/", pos: "noun", meaning: "Musical tone", vi: "Nốt nhạc", ex: "High note", exVi: "Nốt cao" }
    ]),

    createQuickTopic("Art & Creativity", "intermediate", [
        { word: "art", pron: "/ɑːrt/", pos: "noun", meaning: "Creative work", vi: "Nghệ thuật", ex: "Modern art", exVi: "Nghệ thuật hiện đại" },
        { word: "painting", pron: "/ˈpeɪntɪŋ/", pos: "noun", meaning: "Picture art", vi: "Hội họa", ex: "Oil painting", exVi: "Tranh sơn dầu" },
        { word: "sculpture", pron: "/ˈskʌlptʃər/", pos: "noun", meaning: "3D art", vi: "Điêu khắc", ex: "Stone sculpture", exVi: "Tượng đá" },
        { word: "canvas", pron: "/ˈkænvəs/", pos: "noun", meaning: "Painting surface", vi: "Vải canvas", ex: "Paint on canvas", exVi: "Vẽ trên canvas" },
        { word: "brush", pron: "/brʌʃ/", pos: "noun", meaning: "Paint tool", vi: "Cọ vẽ", ex: "Use brush", exVi: "Dùng cọ" },
        { word: "sketch", pron: "/sketʃ/", pos: "noun", meaning: "Quick drawing", vi: "Phác thảo", ex: "Draw sketch", exVi: "Vẽ phác" },
        { word: "artist", pron: "/ˈɑːrtɪst/", pos: "noun", meaning: "Creator", vi: "Nghệ sĩ", ex: "Talented artist", exVi: "Nghệ sĩ tài năng" },
        { word: "gallery", pron: "/ˈɡæləri/", pos: "noun", meaning: "Art space", vi: "Phòng triển lãm", ex: "Art gallery", exVi: "Phòng tranh" },
        { word: "masterpiece", pron: "/ˈmæstərpiːs/", pos: "noun", meaning: "Great work", vi: "Kiệt tác", ex: "Create masterpiece", exVi: "Tạo kiệt tác" },
        { word: "portrait", pron: "/ˈpɔːrtrət/", pos: "noun", meaning: "Face painting", vi: "Chân dung", ex: "Paint portrait", exVi: "Vẽ chân dung" },
        { word: "exhibition", pron: "/ˌeksɪˈbɪʃən/", pos: "noun", meaning: "Art show", vi: "Triển lãm", ex: "Visit exhibition", exVi: "Xem triển lãm" },
        { word: "palette", pron: "/ˈpælət/", pos: "noun", meaning: "Color board", vi: "Bảng màu", ex: "Artist palette", exVi: "Bảng màu họa sĩ" },
        { word: "technique", pron: "/tekˈniːk/", pos: "noun", meaning: "Method", vi: "Kỹ thuật", ex: "Painting technique", exVi: "Kỹ thuật vẽ" },
        { word: "abstract", pron: "/ˈæbstrækt/", pos: "adjective", meaning: "Non-realistic", vi: "Trừu tượng", ex: "Abstract art", exVi: "Nghệ thuật TT" },
        { word: "creativity", pron: "/ˌkriːeɪˈtɪvəti/", pos: "noun", meaning: "Innovation", vi: "Sáng tạo", ex: "Show creativity", exVi: "Thể hiện ST" }
    ]),

    createQuickTopic("Computers & Internet", "intermediate", [
        { word: "browser", pron: "/ˈbraʊzər/", pos: "noun", meaning: "Web app", vi: "Trình duyệt", ex: "Open browser", exVi: "Mở trình duyệt" },
        { word: "email", pron: "/ˈiːmeɪl/", pos: "noun", meaning: "Electronic mail", vi: "Thư điện tử", ex: "Send email", exVi: "Gửi email" },
        { word: "file", pron: "/faɪl/", pos: "noun", meaning: "Data container", vi: "Tập tin", ex: "Save file", exVi: "Lưu file" },
        { word: "folder", pron: "/ˈfoʊldər/", pos: "noun", meaning: "Directory", vi: "Thư mục", ex: "Create folder", exVi: "Tạo thư mục" },
        { word: "network", pron: "/ˈnetwɜːrk/", pos: "noun", meaning: "Connection system", vi: "Mạng", ex: "WiFi network", exVi: "Mạng WiFi" },
        { word: "server", pron: "/ˈsɜːrvər/", pos: "noun", meaning: "Host computer", vi: "Máy chủ", ex: "Web server", exVi: "Máy chủ web" },
        { word: "link", pron: "/lɪŋk/", pos: "noun", meaning: "Connection", vi: "Liên kết", ex: "Click link", exVi: "Nhấp link" },
        { word: "search", pron: "/sɜːrtʃ/", pos: "verb", meaning: "Look for", vi: "Tìm kiếm", ex: "Search online", exVi: "Tìm trên mạng" },
        { word: "login", pron: "/ˈlɒɡɪn/", pos: "noun", meaning: "Sign in", vi: "Đăng nhập", ex: "User login", exVi: "Đăng nhập" },
        { word: "attachment", pron: "/əˈtætʃmənt/", pos: "noun", meaning: "File included", vi: "Tệp đính kèm", ex: "Email attachment", exVi: "File đính kèm" },
        { word: "spam", pron: "/spæm/", pos: "noun", meaning: "Junk mail", vi: "Thư rác", ex: "Delete spam", exVi: "Xóa spam" },
        { word: "cloud", pron: "/klaʊd/", pos: "noun", meaning: "Online storage", vi: "Đám mây", ex: "Cloud storage", exVi: "Lưu trữ đám mây" },
        { word: "router", pron: "/ˈruːtər/", pos: "noun", meaning: "Network device", vi: "Bộ định tuyến", ex: "WiFi router", exVi: "Router WiFi" },
        { word: "firewall", pron: "/ˈfaɪərwɔːl/", pos: "noun", meaning: "Security barrier", vi: "Tường lửa", ex: "Enable firewall", exVi: "Bật tường lửa" },
        { word: "bandwidth", pron: "/ˈbændwɪdθ/", pos: "noun", meaning: "Data speed", vi: "Băng thông", ex: "High bandwidth", exVi: "Băng thông cao" }
    ]),

    createQuickTopic("Cooking & Recipes", "beginner", [
        { word: "cook", pron: "/kʊk/", pos: "verb", meaning: "Prepare food", vi: "Nấu ăn", ex: "Cook dinner", exVi: "Nấu bữa tối" },
        { word: "recipe", pron: "/ˈresəpi/", pos: "noun", meaning: "Instructions", vi: "Công thức", ex: "Follow recipe", exVi: "Làm theo CT" },
        { word: "ingredient", pron: "/ɪnˈɡriːdiənt/", pos: "noun", meaning: "Component", vi: "Nguyên liệu", ex: "Mix ingredients", exVi: "Trộn NL" },
        { word: "oven", pron: "/ˈʌvən/", pos: "noun", meaning: "Baking device", vi: "Lò nướng", ex: "Preheat oven", exVi: "Làm nóng lò" },
        { word: "stove", pron: "/stoʊv/", pos: "noun", meaning: "Cooking surface", vi: "Bếp", ex: "Turn on stove", exVi: "Bật bếp" },
        { word: "boil", pron: "/bɔɪl/", pos: "verb", meaning: "Heat water", vi: "Đun sôi", ex: "Boil water", exVi: "Đun nước" },
        { word: "fry", pron: "/fraɪ/", pos: "verb", meaning: "Cook in oil", vi: "Chiên", ex: "Fry chicken", exVi: "Chiên gà" },
        { word: "bake", pron: "/beɪk/", pos: "verb", meaning: "Cook in oven", vi: "Nướng", ex: "Bake bread", exVi: "Nướng bánh" },
        { word: "chop", pron: "/tʃɒp/", pos: "verb", meaning: "Cut into pieces", vi: "Thái", ex: "Chop vegetables", exVi: "Thái rau" },
        { word: "mix", pron: "/mɪks/", pos: "verb", meaning: "Combine", vi: "Trộn", ex: "Mix well", exVi: "Trộn đều" },
        { word: "taste", pron: "/teɪst/", pos: "verb", meaning: "Try flavor", vi: "Nếm", ex: "Taste food", exVi: "Nếm đồ ăn" },
        { word: "serve", pron: "/sɜːrv/", pos: "verb", meaning: "Give food", vi: "Phục vụ", ex: "Serve hot", exVi: "Phục vụ nóng" },
        { word: "knife", pron: "/naɪf/", pos: "noun", meaning: "Cutting tool", vi: "Dao", ex: "Sharp knife", exVi: "Dao sắc" },
        { word: "pot", pron: "/pɒt/", pos: "noun", meaning: "Cooking container", vi: "Nồi", ex: "Large pot", exVi: "Nồi lớn" },
        { word: "pan", pron: "/pæn/", pos: "noun", meaning: "Flat cookware", vi: "Chảo", ex: "Frying pan", exVi: "Chảo rán" }
    ])
];

// Add 15 more topics with minimal data
const topics6to20 = [
    "Gardening & Plants", "Movies & Cinema", "Books & Literature", "Sports Equipment",
    "Seasons & Nature", "Cleaning & Maintenance", "Tools & Equipment", "Social Events",
    "Beauty & Cosmetics", "Furniture & Decor", "Drinks & Beverages", "Directions & Navigation",
    "School Subjects", "Measurements & Units", "Daily Routines"
].map((name, i) => createQuickTopic(name, "beginner",
    Array(15).fill(0).map((_, j) => ({
        word: `${name.split(' ')[0].toLowerCase()}${j + 1}`,
        meaning: `${name} word ${j + 1}`,
        vi: `Từ ${i + 6}.${j + 1}`,
        ex: `Use ${name.split(' ')[0].toLowerCase()}${j + 1}`,
        exVi: `Dùng từ ${j + 1}`
    }))
));

module.exports = {
    new20Topics: [...next20Topics, ...topics6to20]
};
