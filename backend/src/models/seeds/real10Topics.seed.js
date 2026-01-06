const { STATUS } = require("../../constants/status.constans");

/**
 * 10 REAL TOPICS WITH AUTHENTIC VOCABULARY
 * Each topic contains 15 real English words with accurate definitions
 */

// TOPIC 1: Daily Routines & Habits
const topic1_dailyRoutines = {
  name: "Daily Routines & Habits",
  level: "beginner",
  skill: "reading",
  words: [
    { word: "wake up", pronunciation: "/weɪk ʌp/", partOfSpeech: "verb", level: "beginner", definitions: [{ meaning: "to stop sleeping and become conscious", meaningVi: "thức dậy, tỉnh giấc", example: "I usually wake up at 7 AM.", exampleVi: "Tôi thường thức dậy lúc 7 giờ sáng." }], tags: ["daily-routine", "morning"] },
    { word: "breakfast", pronunciation: "/ˈbrekfəst/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "the first meal of the day", meaningVi: "bữa sáng", example: "I have breakfast at 8 o'clock.", exampleVi: "Tôi ăn sáng lúc 8 giờ." }], tags: ["daily-routine", "food"] },
    { word: "commute", pronunciation: "/kəˈmjuːt/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "to travel regularly between work and home", meaningVi: "đi lại (giữa nhà và nơi làm việc)", example: "I commute to work by train.", exampleVi: "Tôi đi làm bằng tàu hỏa." }], tags: ["daily-routine", "transport"] },
    { word: "routine", pronunciation: "/ruːˈtiːn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "a regular way of doing things", meaningVi: "thói quen, công việc thường ngày", example: "My morning routine includes exercise.", exampleVi: "Thói quen buổi sáng của tôi bao gồm tập thể dục." }], tags: ["daily-routine", "habit"] },
    { word: "shower", pronunciation: "/ˈʃaʊər/", partOfSpeech: "verb", level: "beginner", definitions: [{ meaning: "to wash yourself under a spray of water", meaningVi: "tắm vòi sen", example: "I shower every morning.", exampleVi: "Tôi tắm mỗi sáng." }], tags: ["daily-routine", "hygiene"] },
    { word: "brush", pronunciation: "/brʌʃ/", partOfSpeech: "verb", level: "beginner", definitions: [{ meaning: "to clean your teeth with a brush", meaningVi: "đánh răng", example: "Don't forget to brush your teeth.", exampleVi: "Đừng quên đánh răng nhé." }], tags: ["daily-routine", "hygiene"] },
    { word: "schedule", pronunciation: "/ˈʃedjuːl/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "a plan of activities and when they will happen", meaningVi: "lịch trình, thời gian biểu", example: "I have a busy schedule today.", exampleVi: "Hôm nay tôi có lịch trình bận rộn." }], tags: ["daily-routine", "planning"] },
    { word: "lunch", pronunciation: "/lʌntʃ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "a meal eaten in the middle of the day", meaningVi: "bữa trưa", example: "What did you have for lunch?", exampleVi: "Bạn đã ăn gì vào bữa trưa?" }], tags: ["daily-routine", "food"] },
    { word: "dinner", pronunciation: "/ˈdɪnər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "the main meal of the day", meaningVi: "bữa tối", example: "We have dinner at 7 PM.", exampleVi: "Chúng tôi ăn tối lúc 7 giờ." }], tags: ["daily-routine", "food"] },
    { word: "bedtime", pronunciation: "/ˈbedtaɪm/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "the time when you normally go to bed", meaningVi: "giờ đi ngủ", example: "My bedtime is 11 PM.", exampleVi: "Giờ đi ngủ của tôi là 11 giờ đêm." }], tags: ["daily-routine", "sleep"] },
    { word: "alarm", pronunciation: "/əˈlɑːrm/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "a device that makes noise to wake you", meaningVi: "đồng hồ báo thức", example: "I set my alarm for 6 AM.", exampleVi: "Tôi đặt báo thức lúc 6 giờ sáng." }], tags: ["daily-routine", "device"] },
    { word: "chore", pronunciation: "/tʃɔːr/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "a routine household task", meaningVi: "việc nhà", example: "I do chores on weekends.", exampleVi: "Tôi làm việc nhà vào cuối tuần." }], tags: ["daily-routine", "household"] },
    { word: "exercise", pronunciation: "/ˈeksərsaɪz/", partOfSpeech: "verb", level: "beginner", definitions: [{ meaning: "to do physical activities", meaningVi: "tập thể dục", example: "I exercise every day.", exampleVi: "Tôi tập thể dục mỗi ngày." }], tags: ["daily-routine", "health"] },
    { word: "nap", pronunciation: "/næp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "a short sleep during the day", meaningVi: "giấc ngủ trưa", example: "I take a nap after lunch.", exampleVi: "Tôi ngủ trưa sau bữa trưa." }], tags: ["daily-routine", "rest"] },
    { word: "habit", pronunciation: "/ˈhæbɪt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "something you do regularly", meaningVi: "thói quen", example: "Reading is a good habit.", exampleVi: "Đọc sách là thói quen tốt." }], tags: ["daily-routine", "behavior"] },
  ],
  grammar: {
    topic: "Present Simple Tense",
    explanation: "Present Simple describes habits and routines. Form: Subject + base verb (add 's' for he/she/it).",
    explanationVi: "Thì hiện tại đơn mô tả thói quen. Cấu trúc: Chủ ngữ + động từ nguyên mẫu (thêm 's' cho he/she/it).",
    examples: [
      { sentence: "I wake up at 7 AM every day.", translation: "Tôi thức dậy lúc 7 giờ mỗi ngày." },
      { sentence: "She brushes her teeth twice a day.", translation: "Cô ấy đánh răng hai lần một ngày." },
    ],
  },
};

// TOPIC 2: Shopping & Money
const topic2_shopping = {
  name: "Shopping & Money",
  level: "beginner",
  skill: "speaking",
  words: [
    { word: "purchase", pronunciation: "/ˈpɜːrtʃəs/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "to buy something", meaningVi: "mua", example: "I'd like to purchase this shirt.", exampleVi: "Tôi muốn mua chiếc áo này." }], tags: ["shopping", "transaction"] },
    { word: "receipt", pronunciation: "/rɪˈsiːt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "proof of payment", meaningVi: "hóa đơn", example: "Keep your receipt.", exampleVi: "Giữ hóa đơn của bạn." }], tags: ["shopping", "document"] },
    { word: "discount", pronunciation: "/ˈdɪskaʊnt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "a reduction in price", meaningVi: "giảm giá", example: "There's a 20% discount.", exampleVi: "Có giảm giá 20%." }], tags: ["shopping", "price"] },
    { word: "refund", pronunciation: "/ˈriːfʌnd/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "money returned when you return a product", meaningVi: "hoàn tiền", example: "Can I get a refund?", exampleVi: "Tôi có thể được hoàn tiền không?" }], tags: ["shopping", "return"] },
    { word: "budget", pronunciation: "/ˈbʌdʒɪt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "amount of money you plan to spend", meaningVi: "ngân sách", example: "I'm on a tight budget.", exampleVi: "Tôi có ngân sách eo hẹp." }], tags: ["shopping", "finance"] },
    { word: "bargain", pronunciation: "/ˈbɑːrɡən/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "something bought cheaply", meaningVi: "món hời", example: "This was a bargain!", exampleVi: "Đây là món hời!" }], tags: ["shopping", "value"] },
    { word: "cashier", pronunciation: "/kæˈʃɪr/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "person who handles payments", meaningVi: "thu ngân", example: "Pay at the cashier.", exampleVi: "Thanh toán tại quầy thu ngân." }], tags: ["shopping", "people"] },
    { word: "payment", pronunciation: "/ˈpeɪmənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "the act of paying", meaningVi: "thanh toán", example: "We accept card payments.", exampleVi: "Chúng tôi nhận thanh toán thẻ." }], tags: ["shopping", "transaction"] },
    { word: "expensive", pronunciation: "/ɪkˈspensɪv/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "costing a lot of money", meaningVi: "đắt", example: "This is too expensive.", exampleVi: "Cái này quá đắt." }], tags: ["shopping", "price"] },
    { word: "affordable", pronunciation: "/əˈfɔːrdəbl/", partOfSpeech: "adjective", level: "intermediate", definitions: [{ meaning: "not too expensive", meaningVi: "phải chăng", example: "It has affordable prices.", exampleVi: "Nó có giá phải chăng." }], tags: ["shopping", "price"] },
    { word: "checkout", pronunciation: "/ˈtʃekaʊt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "where you pay in a store", meaningVi: "quầy thanh toán", example: "Proceed to checkout.", exampleVi: "Đến quầy thanh toán." }], tags: ["shopping", "location"] },
    { word: "currency", pronunciation: "/ˈkɜːrənsi/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "money used in a country", meaningVi: "tiền tệ", example: "What currency do you accept?", exampleVi: "Bạn nhận tiền tệ nào?" }], tags: ["shopping", "money"] },
    { word: "wallet", pronunciation: "/ˈwɑːlɪt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "small case for money", meaningVi: "ví tiền", example: "I left my wallet at home.", exampleVi: "Tôi để quên ví ở nhà." }], tags: ["shopping", "accessory"] },
    { word: "sale", pronunciation: "/seɪl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "period of reduced prices", meaningVi: "đợt giảm giá", example: "There's a big sale.", exampleVi: "Có đợt giảm giá lớn." }], tags: ["shopping", "event"] },
    { word: "credit card", pronunciation: "/ˈkredɪt kɑːrd/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "card for buying on credit", meaningVi: "thẻ tín dụng", example: "Can I pay by credit card?", exampleVi: "Tôi trả bằng thẻ được không?" }], tags: ["shopping", "payment"] },
  ],
  grammar: {
    topic: "Modal Verbs (Can, Could, May)",
    explanation: "Modals express ability, permission, requests. Can=ability, Could=polite, May=formal.",
    explanationVi: "Động từ khuyết thiếu diễn tả khả năng, cho phép. Can=khả năng, Could=lịch sự, May=trang trọng.",
    examples: [
      { sentence: "Can I pay by card?", translation: "Tôi có thể trả bằng thẻ không?" },
      { sentence: "Could you give me a discount?", translation: "Bạn giảm giá được không?" },
    ],
  },
};

// TOPIC 3: Travel & Transportation
const topic3_travel = {
  name: "Travel & Transportation",
  level: "intermediate",
  skill: "speaking",
  words: [
    { word: "destination", pronunciation: "/ˌdestɪˈneɪʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "place you are traveling to", meaningVi: "điểm đến", example: "What's your destination?", exampleVi: "Điểm đến của bạn là đâu?" }], tags: ["travel", "location"] },
    { word: "passport", pronunciation: "/ˈpæspɔːrt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "official travel document", meaningVi: "hộ chiếu", example: "Don't forget your passport.", exampleVi: "Đừng quên hộ chiếu." }], tags: ["travel", "document"] },
    { word: "luggage", pronunciation: "/ˈlʌɡɪdʒ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "bags for traveling", meaningVi: "hành lý", example: "Where's my luggage?", exampleVi: "Hành lý của tôi đâu?" }], tags: ["travel", "belongings"] },
    { word: "boarding", pronunciation: "/ˈbɔːrdɪŋ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "getting on a plane/ship", meaningVi: "lên tàu/máy bay", example: "Boarding starts at 3 PM.", exampleVi: "Lên máy bay lúc 3 giờ chiều." }], tags: ["travel", "airport"] },
    { word: "ticket", pronunciation: "/ˈtɪkɪt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "paper allowing you to travel", meaningVi: "vé", example: "I bought a train ticket.", exampleVi: "Tôi đã mua vé tàu." }], tags: ["travel", "document"] },
    { word: "reservation", pronunciation: "/ˌrezərˈveɪʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "booking in advance", meaningVi: "đặt chỗ", example: "I have a hotel reservation.", exampleVi: "Tôi đã đặt khách sạn." }], tags: ["travel", "booking"] },
    { word: "departure", pronunciation: "/dɪˈpɑːrtʃər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "act of leaving", meaningVi: "khởi hành", example: "The departure time is 5 PM.", exampleVi: "Giờ khởi hành là 5 giờ chiều." }], tags: ["travel", "timing"] },
    { word: "arrival", pronunciation: "/əˈraɪvl/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "act of reaching destination", meaningVi: "đến nơi", example: "Estimated arrival is 8 PM.", exampleVi: "Dự kiến đến lúc 8 giờ tối." }], tags: ["travel", "timing"] },
    { word: "delay", pronunciation: "/dɪˈleɪ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "being late", meaningVi: "chậm trễ", example: "There's a 2-hour delay.", exampleVi: "Có chậm trễ 2 tiếng." }], tags: ["travel", "problem"] },
    { word: "customs", pronunciation: "/ˈkʌstəmz/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "border control area", meaningVi: "hải quan", example: "Go through customs here.", exampleVi: "Qua hải quan ở đây." }], tags: ["travel", "airport"] },
    { word: "tourist", pronunciation: "/ˈtʊrɪst/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "person traveling for pleasure", meaningVi: "khách du lịch", example: "Many tourists visit here.", exampleVi: "Nhiều khách du lịch đến đây." }], tags: ["travel", "people"] },
    { word: "journey", pronunciation: "/ˈdʒɜːrni/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "act of traveling somewhere", meaningVi: "cuộc hành trình", example: "Have a safe journey!", exampleVi: "Chúc bạn đi đường bình an!" }], tags: ["travel", "trip"] },
    { word: "sightseeing", pronunciation: "/ˈsaɪtsiːɪŋ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "visiting tourist attractions", meaningVi: "tham quan", example: "We went sightseeing.", exampleVi: "Chúng tôi đi tham quan." }], tags: ["travel", "activity"] },
    { word: "accommodation", pronunciation: "/əˌkɑːməˈdeɪʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "place to stay", meaningVi: "chỗ ở", example: "We need accommodation.", exampleVi: "Chúng tôi cần chỗ ở." }], tags: ["travel", "lodging"] },
    { word: "itinerary", pronunciation: "/aɪˈtɪnəreri/", partOfSpeech: "noun", level: "advanced", definitions: [{ meaning: "planned route or journey", meaningVi: "lịch trình", example: "Check your itinerary.", exampleVi: "Kiểm tra lịch trình của bạn." }], tags: ["travel", "planning"] },
  ],
  grammar: {
    topic: "Future Tense (Will, Going to)",
    explanation: "Future tense expresses future plans. Will=decisions made now, Going to=planned actions.",
    explanationVi: "Thì tương lai diễn tả kế hoạch. Will=quyết định bây giờ, Going to=đã lên kế hoạch.",
    examples: [
      { sentence: "I will visit Paris next year.", translation: "Tôi sẽ đi Paris năm sau." },
      { sentence: "We are going to book a hotel.", translation: "Chúng tôi sắp đặt khách sạn." },
    ],
  },
};

// TOPIC 4: Food & Dining
const topic4_food = {
  name: "Food & Dining",
  level: "beginner",
  skill: "speaking",
  words: [
    { word: "menu", pronunciation: "/ˈmenjuː/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "list of dishes available", meaningVi: "thực đơn", example: "Can I see the menu?", exampleVi: "Cho tôi xem thực đơn?" }], tags: ["food", "restaurant"] },
    { word: "appetizer", pronunciation: "/ˈæpɪtaɪzər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "small dish before main meal", meaningVi: "món khai vị", example: "I'll have soup as appetizer.", exampleVi: "Tôi lấy súp làm khai vị." }], tags: ["food", "course"] },
    { word: "dessert", pronunciation: "/dɪˈzɜːrt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "sweet dish after meal", meaningVi: "món tráng miệng", example: "What's for dessert?", exampleVi: "Món tráng miệng là gì?" }], tags: ["food", "course"] },
    { word: "waiter", pronunciation: "/ˈweɪtər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "person serving food", meaningVi: "bồi bàn", example: "Call the waiter, please.", exampleVi: "Gọi bồi bàn giúp tôi." }], tags: ["food", "people"] },
    { word: "order", pronunciation: "/ˈɔːrdər/", partOfSpeech: "verb", level: "beginner", definitions: [{ meaning: "to request food", meaningVi: "gọi món", example: "Are you ready to order?", exampleVi: "Bạn sẵn sàng gọi món chưa?" }], tags: ["food", "action"] },
    { word: "chef", pronunciation: "/ʃef/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "professional cook", meaningVi: "đầu bếp", example: "The chef is excellent.", exampleVi: "Đầu bếp rất giỏi." }], tags: ["food", "people"] },
    { word: "ingredient", pronunciation: "/ɪnˈɡriːdiənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "food item used in cooking", meaningVi: "nguyên liệu", example: "Fresh ingredients are important.", exampleVi: "Nguyên liệu tươi rất quan trọng." }], tags: ["food", "cooking"] },
    { word: "recipe", pronunciation: "/ˈresəpi/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "cooking instructions", meaningVi: "công thức nấu ăn", example: "Follow this recipe.", exampleVi: "Làm theo công thức này." }], tags: ["food", "cooking"] },
    { word: "delicious", pronunciation: "/dɪˈlɪʃəs/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "very tasty", meaningVi: "ngon", example: "This is delicious!", exampleVi: "Món này ngon quá!" }], tags: ["food", "taste"] },
    { word: "spicy", pronunciation: "/ˈspaɪsi/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "having strong hot flavor", meaningVi: "cay", example: "This curry is too spicy.", exampleVi: "Cà ri này quá cay." }], tags: ["food", "taste"] },
    { word: "vegetarian", pronunciation: "/ˌvedʒəˈteriən/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "person who doesn't eat meat", meaningVi: "người ăn chay", example: "I'm a vegetarian.", exampleVi: "Tôi ăn chay." }], tags: ["food", "diet"] },
    { word: "portion", pronunciation: "/ˈpɔːrʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "amount of food served", meaningVi: "phần ăn", example: "The portions are large.", exampleVi: "Phần ăn rất nhiều." }], tags: ["food", "serving"] },
    { word: "reservation", pronunciation: "/ˌrezərˈveɪʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "booking a table", meaningVi: "đặt bàn", example: "I have a reservation for two.", exampleVi: "Tôi đặt bàn cho hai người." }], tags: ["food", "booking"] },
    { word: "bill", pronunciation: "/bɪl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "statement of money owed", meaningVi: "hóa đơn", example: "Can I have the bill?", exampleVi: "Cho tôi xin hóa đơn?" }], tags: ["food", "payment"] },
    { word: "tip", pronunciation: "/tɪp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "extra money for service", meaningVi: "tiền boa", example: "I left a 15% tip.", exampleVi: "Tôi để 15% tiền boa." }], tags: ["food", "payment"] },
  ],
  grammar: {
    topic: "Countable & Uncountable Nouns",
    explanation: "Countable nouns have plural forms (apple/apples). Uncountable have no plural (water, rice). Use much/little for uncountable, many/few for countable.",
    explanationVi: "Danh từ đếm được có số nhiều. Danh từ không đếm được không có số nhiều. Dùng much/little cho không đếm được, many/few cho đếm được.",
    examples: [
      { sentence: "I need some eggs and milk.", translation: "Tôi cần ít trứng và sữa." },
      { sentence: "There isn't much rice left.", translation: "Không còn nhiều gạo." },
    ],
  },
};

// TOPIC 5: Health & Medicine
const topic5_health = {
  name: "Health & Medicine",
  level: "intermediate",
  skill: "reading",
  words: [
    { word: "symptoms", pronunciation: "/ˈsɪmptəmz/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "signs of illness", meaningVi: "triệu chứng", example: "What are your symptoms?", exampleVi: "Triệu chứng của bạn là gì?" }], tags: ["health", "medical"] },
    { word: "prescription", pronunciation: "/prɪˈskrɪpʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "doctor's written order for medicine", meaningVi: "đơn thuốc", example: "You need a prescription.", exampleVi: "Bạn cần đơn thuốc." }], tags: ["health", "medical"] },
    { word: "appointment", pronunciation: "/əˈpɔɪntmənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "scheduled meeting with doctor", meaningVi: "cuộc hẹn khám", example: "I have a doctor's appointment.", exampleVi: "Tôi có hẹn khám bác sĩ." }], tags: ["health", "medical"] },
    { word: "fever", pronunciation: "/ˈfiːvər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "high body temperature", meaningVi: "sốt", example: "I have a fever.", exampleVi: "Tôi bị sốt." }], tags: ["health", "symptom"] },
    { word: "cough", pronunciation: "/kɔːf/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "sudden air expulsion from lungs", meaningVi: "ho", example: "I have a bad cough.", exampleVi: "Tôi ho nhiều." }], tags: ["health", "symptom"] },
    { word: "headache", pronunciation: "/ˈhedeɪk/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "pain in the head", meaningVi: "đau đầu", example: "I have a terrible headache.", exampleVi: "Tôi đau đầu kinh khủng." }], tags: ["health", "symptom"] },
    { word: "medicine", pronunciation: "/ˈmedsn/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "substance for treating illness", meaningVi: "thuốc", example: "Take this medicine twice daily.", exampleVi: "Uống thuốc này hai lần mỗi ngày." }], tags: ["health", "treatment"] },
    { word: "surgery", pronunciation: "/ˈsɜːrdʒəri/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "medical operation", meaningVi: "phẫu thuật", example: "He needs surgery.", exampleVi: "Anh ấy cần phẫu thuật." }], tags: ["health", "treatment"] },
    { word: "patient", pronunciation: "/ˈpeɪʃnt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "person receiving medical care", meaningVi: "bệnh nhân", example: "The patient is recovering.", exampleVi: "Bệnh nhân đang hồi phục." }], tags: ["health", "people"] },
    { word: "emergency", pronunciation: "/ɪˈmɜːrdʒənsi/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "serious urgent situation", meaningVi: "cấp cứu", example: "Call emergency services!", exampleVi: "Gọi cấp cứu!" }], tags: ["health", "urgent"] },
    { word: "vaccine", pronunciation: "/vækˈsiːn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "substance preventing disease", meaningVi: "vắc-xin", example: "Get the flu vaccine.", exampleVi: "Tiêm vắc-xin cúm." }], tags: ["health", "prevention"] },
    { word: "checkup", pronunciation: "/ˈtʃekʌp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "routine health examination", meaningVi: "khám sức khỏe", example: "Annual checkup is important.", exampleVi: "Khám sức khỏe hàng năm rất quan trọng." }], tags: ["health", "examination"] },
    { word: "injury", pronunciation: "/ˈɪndʒəri/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "physical harm", meaningVi: "chấn thương", example: "He has a sports injury.", exampleVi: "Anh ấy bị chấn thương thể thao." }], tags: ["health", "accident"] },
    { word: "recovery", pronunciation: "/rɪˈkʌvəri/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "return to health", meaningVi: "hồi phục", example: "Wishing you a quick recovery.", exampleVi: "Chúc bạn mau hồi phục." }], tags: ["health", "healing"] },
    { word: "diagnosis", pronunciation: "/ˌdaɪəɡˈnoʊsɪs/", partOfSpeech: "noun", level: "advanced", definitions: [{ meaning: "identification of illness", meaningVi: "chẩn đoán", example: "The diagnosis was correct.", exampleVi: "Chẩn đoán đúng." }], tags: ["health", "medical"] },
  ],
  grammar: {
    topic: "Imperative Sentences",
    explanation: "Imperatives give commands/instructions. Form: Base verb. Add 'Don't' for negative. Used in medical advice.",
    explanationVi: "Câu mệnh lệnh đưa ra lệnh/hướng dẫn. Cấu trúc: Động từ nguyên mẫu. Thêm 'Don't' cho phủ định.",
    examples: [
      { sentence: "Take this medicine twice a day.", translation: "Uống thuốc này hai lần mỗi ngày." },
      { sentence: "Don't skip your meals.", translation: "Đừng bỏ bữa." },
    ],
  },
};

// TOPIC 6: Technology & Internet
const topic6_technology = {
  name: "Technology & Internet",
  level: "intermediate",
  skill: "reading",
  words: [
    { word: "download", pronunciation: "/ˌdaʊnˈloʊd/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "transfer data from internet", meaningVi: "tải xuống", example: "Download the app.", exampleVi: "Tải ứng dụng xuống." }], tags: ["technology", "internet"] },
    { word: "upload", pronunciation: "/ˌʌpˈloʊd/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "transfer data to internet", meaningVi: "tải lên", example: "Upload your photo.", exampleVi: "Tải ảnh của bạn lên." }], tags: ["technology", "internet"] },
    { word: "password", pronunciation: "/ˈpæswɜːrd/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "secret code for access", meaningVi: "mật khẩu", example: "Enter your password.", exampleVi: "Nhập mật khẩu của bạn." }], tags: ["technology", "security"] },
    { word: "browser", pronunciation: "/ˈbraʊzər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "software for viewing websites", meaningVi: "trình duyệt", example: "Open your browser.", exampleVi: "Mở trình duyệt." }], tags: ["technology", "internet"] },
    { word: "software", pronunciation: "/ˈsɔːftwer/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "computer programs", meaningVi: "phần mềm", example: "Install the software.", exampleVi: "Cài đặt phần mềm." }], tags: ["technology", "computer"] },
    { word: "hardware", pronunciation: "/ˈhɑːrdwer/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "physical computer parts", meaningVi: "phần cứng", example: "The hardware is outdated.", exampleVi: "Phần cứng đã lỗi thời." }], tags: ["technology", "computer"] },
    { word: "wi-fi", pronunciation: "/ˈwaɪfaɪ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "wireless internet connection", meaningVi: "wi-fi", example: "Connect to wi-fi.", exampleVi: "Kết nối wi-fi." }], tags: ["technology", "internet"] },
    { word: "email", pronunciation: "/ˈiːmeɪl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "electronic message", meaningVi: "thư điện tử", example: "Send me an email.", exampleVi: "Gửi email cho tôi." }], tags: ["technology", "communication"] },
    { word: "virus", pronunciation: "/ˈvaɪrəs/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "malicious computer program", meaningVi: "vi-rút", example: "Your computer has a virus.", exampleVi: "Máy tính bạn bị vi-rút." }], tags: ["technology", "security"] },
    { word: "backup", pronunciation: "/ˈbækʌp/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "copy of data for safety", meaningVi: "sao lưu", example: "Make a backup of your files.", exampleVi: "Sao lưu tệp của bạn." }], tags: ["technology", "data"] },
    { word: "update", pronunciation: "/ˌʌpˈdeɪt/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "make more current", meaningVi: "cập nhật", example: "Update your software.", exampleVi: "Cập nhật phần mềm." }], tags: ["technology", "maintenance"] },
    { word: "screenshot", pronunciation: "/ˈskriːnʃɑːt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "image of screen display", meaningVi: "ảnh chụp màn hình", example: "Take a screenshot.", exampleVi: "Chụp màn hình." }], tags: ["technology", "image"] },
    { word: "storage", pronunciation: "/ˈstɔːrɪdʒ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "space for keeping data", meaningVi: "bộ nhớ", example: "I need more storage.", exampleVi: "Tôi cần thêm bộ nhớ." }], tags: ["technology", "data"] },
    { word: "application", pronunciation: "/ˌæplɪˈkeɪʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "software program", meaningVi: "ứng dụng", example: "Download this application.", exampleVi: "Tải ứng dụng này." }], tags: ["technology", "software"] },
    { word: "network", pronunciation: "/ˈnetwɜːrk/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "connected computers", meaningVi: "mạng", example: "Join the network.", exampleVi: "Tham gia mạng." }], tags: ["technology", "connection"] },
  ],
  grammar: {
    topic: "Passive Voice",
    explanation: "Passive focuses on action, not doer. Form: be + past participle. Used in tech instructions.",
    explanationVi: "Câu bị động tập trung vào hành động. Cấu trúc: be + quá khứ phân từ. Dùng trong hướng dẫn công nghệ.",
    examples: [
      { sentence: "The file was downloaded.", translation: "Tệp đã được tải xuống." },
      { sentence: "Your password must be changed.", translation: "Mật khẩu phải được thay đổi." },
    ],
  },
};

// TOPIC 7: Work & Office
const topic7_work = {
  name: "Work & Office",
  level: "intermediate",
  skill: "speaking",
  words: [
    { word: "colleague", pronunciation: "/ˈkɑːliːɡ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "person you work with", meaningVi: "đồng nghiệp", example: "My colleague helped me.", exampleVi: "Đồng nghiệp giúp tôi." }], tags: ["work", "people"] },
    { word: "meeting", pronunciation: "/ˈmiːtɪŋ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "gathering for discussion", meaningVi: "cuộc họp", example: "We have a meeting at 2 PM.", exampleVi: "Chúng ta họp lúc 2 giờ." }], tags: ["work", "event"] },
    { word: "deadline", pronunciation: "/ˈdedlaɪn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "time limit for completion", meaningVi: "hạn chót", example: "The deadline is tomorrow.", exampleVi: "Hạn chót là ngày mai." }], tags: ["work", "time"] },
    { word: "presentation", pronunciation: "/ˌprezənˈteɪʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "formal talk to audience", meaningVi: "bài thuyết trình", example: "Prepare your presentation.", exampleVi: "Chuẩn bị bài thuyết trình." }], tags: ["work", "communication"] },
    { word: "project", pronunciation: "/ˈprɑːdʒekt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "planned work task", meaningVi: "dự án", example: "We're working on a project.", exampleVi: "Chúng tôi đang làm dự án." }], tags: ["work", "task"] },
    { word: "salary", pronunciation: "/ˈsæləri/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "regular payment for work", meaningVi: "lương", example: "My salary increased.", exampleVi: "Lương tôi tăng." }], tags: ["work", "payment"] },
    { word: "promotion", pronunciation: "/prəˈmoʊʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "advancement to higher position", meaningVi: "thăng chức", example: "She got a promotion.", exampleVi: "Cô ấy được thăng chức." }], tags: ["work", "career"] },
    { word: "resign", pronunciation: "/rɪˈzaɪn/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "leave a job voluntarily", meaningVi: "từ chức", example: "He decided to resign.", exampleVi: "Anh ấy quyết định từ chức." }], tags: ["work", "career"] },
    { word: "interview", pronunciation: "/ˈɪntərvjuː/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "formal meeting for job", meaningVi: "phỏng vấn", example: "I have a job interview.", exampleVi: "Tôi có buổi phỏng vấn." }], tags: ["work", "recruitment"] },
    { word: "resume", pronunciation: "/ˈrezumeɪ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "summary of qualifications", meaningVi: "sơ yếu lý lịch", example: "Send your resume.", exampleVi: "Gửi sơ yếu lý lịch." }], tags: ["work", "document"] },
    { word: "overtime", pronunciation: "/ˈoʊvərtaɪm/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "time worked beyond normal hours", meaningVi: "làm thêm giờ", example: "I worked overtime yesterday.", exampleVi: "Hôm qua tôi làm thêm giờ." }], tags: ["work", "time"] },
    { word: "contract", pronunciation: "/ˈkɑːntrækt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "legal work agreement", meaningVi: "hợp đồng", example: "Sign the contract.", exampleVi: "Ký hợp đồng." }], tags: ["work", "legal"] },
    { word: "department", pronunciation: "/dɪˈpɑːrtmənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "division of organization", meaningVi: "phòng ban", example: "Which department are you in?", exampleVi: "Bạn ở phòng ban nào?" }], tags: ["work", "organization"] },
    { word: "supervisor", pronunciation: "/ˈsuːpərvaɪzər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "person who oversees work", meaningVi: "giám sát viên", example: "Talk to your supervisor.", exampleVi: "Nói chuyện với giám sát viên." }], tags: ["work", "people"] },
    { word: "task", pronunciation: "/tæsk/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "piece of work to be done", meaningVi: "nhiệm vụ", example: "Complete this task first.", exampleVi: "Hoàn thành nhiệm vụ này trước." }], tags: ["work", "assignment"] },
  ],
  grammar: {
    topic: "Reported Speech",
    explanation: "Reported speech tells what someone said. Change pronouns, tenses, time expressions. Say/tell + that clause.",
    explanationVi: "Câu tường thuật kể lại lời nói. Thay đổi đại từ, thì, từ chỉ thời gian. Say/tell + mệnh đề that.",
    examples: [
      { sentence: "She said she was busy.", translation: "Cô ấy nói cô ấy bận." },
      { sentence: "He told me to finish the report.", translation: "Anh ấy bảo tôi hoàn thành báo cáo." },
    ],
  },
};

// TOPIC 8: Weather & Nature
const topic8_weather = {
  name: "Weather & Nature",
  level: "beginner",
  skill: "reading",
  words: [
    { word: "sunny", pronunciation: "/ˈsʌni/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "bright with sunlight", meaningVi: "nắng", example: "It's sunny today.", exampleVi: "Hôm nay trời nắng." }], tags: ["weather", "condition"] },
    { word: "rainy", pronunciation: "/ˈreɪni/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "having rain", meaningVi: "mưa", example: "Tomorrow will be rainy.", exampleVi: "Ngày mai sẽ mưa." }], tags: ["weather", "condition"] },
    { word: "cloudy", pronunciation: "/ˈklaʊdi/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "covered with clouds", meaningVi: "nhiều mây", example: "It's cloudy this morning.", exampleVi: "Sáng nay trời nhiều mây." }], tags: ["weather", "condition"] },
    { word: "windy", pronunciation: "/ˈwɪndi/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "with strong wind", meaningVi: "có gió", example: "It's very windy outside.", exampleVi: "Bên ngoài gió lớn." }], tags: ["weather", "condition"] },
    { word: "temperature", pronunciation: "/ˈtemprətʃər/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "degree of heat", meaningVi: "nhiệt độ", example: "The temperature is 25°C.", exampleVi: "Nhiệt độ là 25°C." }], tags: ["weather", "measurement"] },
    { word: "forecast", pronunciation: "/ˈfɔːrkæst/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "prediction of weather", meaningVi: "dự báo", example: "Check the weather forecast.", exampleVi: "Kiểm tra dự báo thời tiết." }], tags: ["weather", "prediction"] },
    { word: "storm", pronunciation: "/stɔːrm/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "violent weather with wind/rain", meaningVi: "bão", example: "A storm is coming.", exampleVi: "Một cơn bão đang đến." }], tags: ["weather", "extreme"] },
    { word: "flood", pronunciation: "/flʌd/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "overflow of water", meaningVi: "lũ lụt", example: "The flood damaged houses.", exampleVi: "Lũ lụt phá hủy nhà cửa." }], tags: ["weather", "disaster"] },
    { word: "drought", pronunciation: "/draʊt/", partOfSpeech: "noun", level: "advanced", definitions: [{ meaning: "long period without rain", meaningVi: "hạn hán", example: "The drought lasted months.", exampleVi: "Hạn hán kéo dài nhiều tháng." }], tags: ["weather", "condition"] },
    { word: "humidity", pronunciation: "/hjuːˈmɪdəti/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "amount of moisture in air", meaningVi: "độ ẩm", example: "High humidity makes it uncomfortable.", exampleVi: "Độ ẩm cao làm khó chịu." }], tags: ["weather", "measurement"] },
    { word: "rainbow", pronunciation: "/ˈreɪnboʊ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "colorful arc in sky after rain", meaningVi: "cầu vồng", example: "Look at the rainbow!", exampleVi: "Nhìn cầu vồng kìa!" }], tags: ["weather", "phenomenon"] },
    { word: "thunder", pronunciation: "/ˈθʌndər/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "loud sound during storm", meaningVi: "sấm", example: "I heard thunder.", exampleVi: "Tôi nghe thấy sấm." }], tags: ["weather", "sound"] },
    { word: "lightning", pronunciation: "/ˈlaɪtnɪŋ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "bright flash during storm", meaningVi: "sét", example: "Lightning struck the tree.", exampleVi: "Sét đánh vào cây." }], tags: ["weather", "phenomenon"] },
    { word: "season", pronunciation: "/ˈsiːzn/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "division of year (spring/summer/fall/winter)", meaningVi: "mùa", example: "What's your favorite season?", exampleVi: "Bạn thích mùa nào nhất?" }], tags: ["weather", "time"] },
    { word: "climate", pronunciation: "/ˈklaɪmət/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "typical weather of a place", meaningVi: "khí hậu", example: "Vietnam has a tropical climate.", exampleVi: "Việt Nam có khí hậu nhiệt đới." }], tags: ["weather", "geography"] },
  ],
  grammar: {
    topic: "Comparatives & Superlatives",
    explanation: "Comparatives compare two things (hotter, more beautiful). Superlatives show extreme (hottest, most beautiful). Add -er/-est or more/most.",
    explanationVi: "So sánh hơn so sánh hai thứ (nóng hơn). So sánh nhất thể hiện cực độ (nóng nhất). Thêm -er/-est hoặc more/most.",
    examples: [
      { sentence: "Today is hotter than yesterday.", translation: "Hôm nay nóng hơn hôm qua." },
      { sentence: "This is the coldest day of the year.", translation: "Đây là ngày lạnh nhất trong năm." },
    ],
  },
};

// TOPIC 9: Family & Relationships
const topic9_family = {
  name: "Family & Relationships",
  level: "beginner",
  skill: "speaking",
  words: [
    { word: "parents", pronunciation: "/ˈperənts/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "mother and father", meaningVi: "cha mẹ", example: "I live with my parents.", exampleVi: "Tôi sống với cha mẹ." }], tags: ["family", "people"] },
    { word: "sibling", pronunciation: "/ˈsɪblɪŋ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "brother or sister", meaningVi: "anh chị em", example: "I have two siblings.", exampleVi: "Tôi có hai anh chị em." }], tags: ["family", "people"] },
    { word: "relative", pronunciation: "/ˈrelətɪv/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "family member", meaningVi: "họ hàng", example: "My relatives visit often.", exampleVi: "Họ hàng tôi thường đến thăm." }], tags: ["family", "people"] },
    { word: "cousin", pronunciation: "/ˈkʌzn/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "child of aunt or uncle", meaningVi: "anh chị em họ", example: "My cousin is a doctor.", exampleVi: "Anh họ tôi là bác sĩ." }], tags: ["family", "people"] },
    { word: "aunt", pronunciation: "/ænt/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "sister of parent", meaningVi: "dì, cô", example: "My aunt lives in Hanoi.", exampleVi: "Dì tôi sống ở Hà Nội." }], tags: ["family", "people"] },
    { word: "uncle", pronunciation: "/ˈʌŋkl/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "brother of parent", meaningVi: "chú, bác", example: "Uncle Tom is funny.", exampleVi: "Chú Tom vui tính." }], tags: ["family", "people"] },
    { word: "grandparents", pronunciation: "/ˈɡrænˌperənts/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "parents of parents", meaningVi: "ông bà", example: "I visit my grandparents.", exampleVi: "Tôi thăm ông bà." }], tags: ["family", "people"] },
    { word: "spouse", pronunciation: "/spaʊs/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "husband or wife", meaningVi: "vợ hoặc chồng", example: "My spouse works downtown.", exampleVi: "Vợ/chồng tôi làm việc ở trung tâm." }], tags: ["family", "people"] },
    { word: "engaged", pronunciation: "/ɪnˈɡeɪdʒd/", partOfSpeech: "adjective", level: "intermediate", definitions: [{ meaning: "promised to marry", meaningVi: "đính hôn", example: "They just got engaged.", exampleVi: "Họ vừa đính hôn." }], tags: ["family", "relationship"] },
    { word: "married", pronunciation: "/ˈmærid/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "joined in marriage", meaningVi: "đã kết hôn", example: "Are you married?", exampleVi: "Bạn đã kết hôn chưa?" }], tags: ["family", "status"] },
    { word: "divorced", pronunciation: "/dɪˈvɔːrst/", partOfSpeech: "adjective", level: "intermediate", definitions: [{ meaning: "legally ended marriage", meaningVi: "đã ly hôn", example: "My parents are divorced.", exampleVi: "Cha mẹ tôi đã ly hôn." }], tags: ["family", "status"] },
    { word: "single", pronunciation: "/ˈsɪŋɡl/", partOfSpeech: "adjective", level: "beginner", definitions: [{ meaning: "not married", meaningVi: "độc thân", example: "I'm still single.", exampleVi: "Tôi vẫn độc thân." }], tags: ["family", "status"] },
    { word: "adopt", pronunciation: "/əˈdɑːpt/", partOfSpeech: "verb", level: "intermediate", definitions: [{ meaning: "take child as your own", meaningVi: "nhận nuôi", example: "They adopted a baby.", exampleVi: "Họ nhận nuôi một bé." }], tags: ["family", "action"] },
    { word: "ancestor", pronunciation: "/ˈænsestər/", partOfSpeech: "noun", level: "advanced", definitions: [{ meaning: "person from the past in family", meaningVi: "tổ tiên", example: "My ancestors came from China.", exampleVi: "Tổ tiên tôi đến từ Trung Quốc." }], tags: ["family", "history"] },
    { word: "twin", pronunciation: "/twɪn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "one of two children born together", meaningVi: "sinh đôi", example: "She has a twin brother.", exampleVi: "Cô ấy có anh trai sinh đôi." }], tags: ["family", "people"] },
  ],
  grammar: {
    topic: "Possessive Pronouns & Adjectives",
    explanation: "Possessive adjectives (my, your, his) come before nouns. Possessive pronouns (mine, yours, his) replace nouns.",
    explanationVi: "Tính từ sở hữu (my, your) đứng trước danh từ. Đại từ sở hữu (mine, yours) thay thế danh từ.",
    examples: [
      { sentence: "This is my family.", translation: "Đây là gia đình tôi." },
      { sentence: "That house is mine.", translation: "Ngôi nhà đó là của tôi." },
    ],
  },
};

// TOPIC 10: Hobbies & Entertainment
const topic10_hobbies = {
  name: "Hobbies & Entertainment",
  level: "beginner",
  skill: "speaking",
  words: [
    { word: "hobby", pronunciation: "/ˈhɑːbi/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "activity done for pleasure", meaningVi: "sở thích", example: "What's your hobby?", exampleVi: "Sở thích của bạn là gì?" }], tags: ["hobby", "leisure"] },
    { word: "painting", pronunciation: "/ˈpeɪntɪŋ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "creating pictures with paint", meaningVi: "vẽ tranh", example: "I enjoy painting.", exampleVi: "Tôi thích vẽ tranh." }], tags: ["hobby", "art"] },
    { word: "reading", pronunciation: "/ˈriːdɪŋ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "looking at and understanding written words", meaningVi: "đọc sách", example: "Reading is relaxing.", exampleVi: "Đọc sách rất thư giãn." }], tags: ["hobby", "activity"] },
    { word: "photography", pronunciation: "/fəˈtɑːɡrəfi/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "taking pictures with camera", meaningVi: "chụp ảnh", example: "He's into photography.", exampleVi: "Anh ấy thích chụp ảnh." }], tags: ["hobby", "art"] },
    { word: "gardening", pronunciation: "/ˈɡɑːrdnɪŋ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "growing plants", meaningVi: "làm vườn", example: "My mom loves gardening.", exampleVi: "Mẹ tôi thích làm vườn." }], tags: ["hobby", "activity"] },
    { word: "cooking", pronunciation: "/ˈkʊkɪŋ/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "preparing food", meaningVi: "nấu ăn", example: "Cooking is fun!", exampleVi: "Nấu ăn rất vui!" }], tags: ["hobby", "activity"] },
    { word: "movie", pronunciation: "/ˈmuːvi/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "motion picture film", meaningVi: "phim", example: "Let's watch a movie.", exampleVi: "Cùng xem phim đi." }], tags: ["entertainment", "media"] },
    { word: "concert", pronunciation: "/ˈkɑːnsərt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "musical performance", meaningVi: "buổi hòa nhạc", example: "I went to a concert.", exampleVi: "Tôi đi xem hòa nhạc." }], tags: ["entertainment", "music"] },
    { word: "museum", pronunciation: "/mjuˈziːəm/", partOfSpeech: "noun", level: "beginner", definitions: [{ meaning: "building with historical objects", meaningVi: "bảo tàng", example: "Visit the art museum.", exampleVi: "Thăm bảo tàng nghệ thuật." }], tags: ["entertainment", "culture"] },
    { word: "festival", pronunciation: "/ˈfestɪvl/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "celebration or event", meaningVi: "lễ hội", example: "The music festival was amazing.", exampleVi: "Lễ hội âm nhạc tuyệt vời." }], tags: ["entertainment", "event"] },
    { word: "chess", pronunciation: "/tʃes/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "strategic board game", meaningVi: "cờ vua", example: "Do you play chess?", exampleVi: "Bạn chơi cờ vua không?" }], tags: ["hobby", "game"] },
    { word: "collection", pronunciation: "/kəˈlekʃn/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "group of collected items", meaningVi: "bộ sưu tập", example: "I have a stamp collection.", exampleVi: "Tôi có bộ sưu tập tem." }], tags: ["hobby", "activity"] },
    { word: "gaming", pronunciation: "/ˈɡeɪmɪŋ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "playing video games", meaningVi: "chơi game", example: "He spends time gaming.", exampleVi: "Anh ấy dành thời gian chơi game." }], tags: ["hobby", "digital"] },
    { word: "knitting", pronunciation: "/ˈnɪtɪŋ/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "making fabric with needles", meaningVi: "đan len", example: "Grandma is knitting a sweater.", exampleVi: "Bà đang đan áo len." }], tags: ["hobby", "craft"] },
    { word: "instrument", pronunciation: "/ˈɪnstrəmənt/", partOfSpeech: "noun", level: "intermediate", definitions: [{ meaning: "tool for making music", meaningVi: "nhạc cụ", example: "I play musical instruments.", exampleVi: "Tôi chơi nhạc cụ." }], tags: ["hobby", "music"] },
  ],
  grammar: {
    topic: "Gerunds & Infinitives",
    explanation: "Gerunds (verb+ing) act as nouns. Infinitives (to+verb) express purpose. Some verbs take gerunds (enjoy, finish), some take infinitives (want, need).",
    explanationVi: "Danh động từ (verb+ing) hoạt động như danh từ. Động từ nguyên mẫu có to diễn tả mục đích. Một số động từ theo sau danh động từ, một số theo động từ nguyên mẫu.",
    examples: [
      { sentence: "I enjoy reading books.", translation: "Tôi thích đọc sách." },
      { sentence: "She wants to learn piano.", translation: "Cô ấy muốn học piano." },
    ],
  },
};

// Helper function to create seed data for one topic
async function seedTopic(topicData, categoryId, userId) {
  const Word = require("../Word");
  const CardDeck = require("../CardDeck");
  const FlashCard = require("../FlashCard");
  const ContentBlock = require("../subModel/contentBlock.schema");
  const Lesson = require("../Lessson");
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

  console.log(`🌱 Seeding: ${topicData.name}`);

  // 1. Create Words
  console.log(`  📝 Creating words...`);
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
  console.log(`  ✅ Created ${createdWords.length} words`);

  // 2. Create Card Deck
  console.log(`  🎴 Creating card deck...`);
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
  console.log(`  ✅ Created card deck: ${cardDeck.title}`);

  // 3. Create Flashcards
  console.log(`  🃏 Creating flashcards...`);
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
  console.log(`  ✅ Created ${createdFlashcards.length} flashcards`);

  // 4. Create Lesson
  console.log(`  📚 Creating lesson...`);
  const lesson = await Lesson.create({
    title: topicData.name,
    description: `Master ${topicData.name.toLowerCase()} with grammar, vocabulary, and exercises`,
    topic: topicData.name,
    skill: topicData.skill,
    level: topicData.level,
    categoryId: categoryId,
    duration_minutes: 45,
    status: STATUS.ACTIVE,
    createdBy: userId,
    blocks: [],
  });
  results.lesson = lesson;
  console.log(`  ✅ Created lesson: ${lesson.title}`);

  // 5. Create Blocks
  console.log(`  🧱 Creating blocks...`);
  const blocks = [];

  // Grammar Block
  const grammarBlock = await ContentBlock.create({
    type: "grammar",
    title: `${topicData.grammar.topic}`,
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
  console.log(`    ✓ Grammar block`);

  // Vocabulary Block
  const vocabularyBlock = await ContentBlock.create({
    type: "vocabulary",
    title: `${topicData.name} - Vocabulary Practice`,
    description: `Practice essential vocabulary`,
    skill: topicData.skill,
    difficulty: topicData.level,
    lessonId: lesson._id,
    cardDeck: cardDeck._id,
    status: STATUS.ACTIVE,
    order: 2,
  });
  blocks.push(vocabularyBlock);
  console.log(`    ✓ Vocabulary block`);

  // Media Block
  const mediaBlock = await ContentBlock.create({
    type: "media",
    title: `${topicData.name} - Video Lesson`,
    description: `Watch and learn`,
    skill: "listening",
    difficulty: topicData.level,
    lessonId: lesson._id,
    mediaType: "video",
    sourceType: "youtube",
    sourceUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: STATUS.ACTIVE,
    order: 3,
  });
  blocks.push(mediaBlock);
  console.log(`    ✓ Media block`);

  results.blocks = blocks;

  // 6. Update Lesson with Blocks
  lesson.blocks = blocks.map((block, index) => ({
    block: block._id,
    order: index + 1,
  }));
  await lesson.save();
  console.log(`  🔗 Linked blocks to lesson`);

  // 7. Create Quiz
  console.log(`  📝 Creating quiz...`);
  const quizQuestions = createdWords.slice(0, 5).map((word) => ({
    type: "multiple_choice",
    questionText: `What does "${word.word}" mean?`,
    options: [
      { text: word.definitions[0].meaningVi, isCorrect: true },
      { text: "Một lựa chọn không đúng", isCorrect: false },
      { text: "Lựa chọn sai khác", isCorrect: false },
      { text: "Đáp án không chính xác", isCorrect: false },
    ],
    correctAnswer: word.definitions[0].meaningVi,
    explanation: `"${word.word}" có nghĩa là "${word.definitions[0].meaningVi}"`,
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
  console.log(`  ✅ Created quiz with ${quizQuestions.length} questions`);

  console.log(`✅ Successfully seeded: ${topicData.name}\n`);
  return results;
}

module.exports = {
  topic1_dailyRoutines,
  topic2_shopping,
  topic3_travel,
  topic4_food,
  topic5_health,
  topic6_technology,
  topic7_work,
  topic8_weather,
  topic9_family,
  topic10_hobbies,
  seedTopic,
};
