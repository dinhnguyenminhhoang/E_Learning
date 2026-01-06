# Comprehensive Seed Data - 10 Topics

Seed data đầy đủ cho 10 chủ đề tiếng Anh với toàn bộ mapping:
**Words → Flashcards → Card Decks → Blocks → Lessons → Quizzes**

## 📊 Summary

- **10 Topics** covering essential English themes
- **150 Words** total (15 words per topic  
- **10 Card Decks** (1 per topic)
- **150 Flashcards** (15 per topic)
- **30 Blocks** (3 per topic: grammar, vocabulary, media)
- **10 Lessons** (1 per topic)
- **10 Quizzes** (1 per topic)

## 📚 Topics Included

1. **Daily Life & Routines** - Beginner level, everyday activities
2. **Business & Work** - Intermediate level, professional vocabulary  
3. **Travel & Tourism** - Intermediate level, travel essentials
4. **Health & Wellness** - Intermediate level, medical terms
5. **Technology & Digital Life** - Intermediate level, tech vocabulary
6. **Education & Learning** - Intermediate level, academic terms
7. **Food & Dining** - Beginner level, food and restaurants
8. **Sports & Fitness** - Intermediate level, sports terminology
9. **Environment & Nature** - Intermediate level, ecology terms
10. **Entertainment & Hobbies** - Beginner level, leisure activities

## 🚀 How to Run

### Option 1: Seed All Topics
```bash
cd backend
node src/scripts/seedComprehensive.js
```

### Option 2: Seed One Topic (for testing)
```bash
# Edit seedComprehensive.js to use single topic:
# const results = await seedTopic(topic1_dailyLife, category._id);
node src/scripts/seedComprehensive.js
```

## 📁 File Structure

```
backend/src/models/seeds/
├── comprehensive.seed.js      # Master file (imports all)
├── allTopics.seed.js          # Topics 1-3 + helper function
├── additionalTopics.seed.js   # Topics 4-7
├── finalTopics.seed.js        # Topics 8-10

backend/src/scripts/
└── seedComprehensive.js       # Execution script
```

## 🔗 Data Relationships

Each topic creates:
```
Words (15) 
  ↓
Flashcards (15) → CardDeck (1)
  ↓
Blocks:
  - Grammar Block (1) → Lesson
  - Vocabulary Block (1) → Lesson → CardDeck
  - Media Block (1) → Lesson
  ↓
Lesson (1) → [blocks array]
  ↓
Quiz (1) → attached to Lesson
```

## ⚙️ Environment Setup

Make sure MongoDB connection string is set:
```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/e-learning
```

## 📝 Sample Output

```
🌱 Seeding: Daily Life & Routines
  📁 Using category: 64a1b2c3d4e5f6g7h8i9j0k1
  📝 Creating words...
  ✅ Created 15 words
  🎴 Creating card deck...
  ✅ Created card deck: Daily Life Vocabulary
  🃏 Creating flashcards...
  ✅ Created 15 flashcards
  📚 Creating lesson...
  ✅ Created lesson: Daily Life and Routines
  🧱 Creating blocks...
    ✓ Created grammar block: Present Simple for Daily Routines
    ✓ Created vocabulary block: Daily Life Words Practice
    ✓ Created media block: A Day in My Life
  📝 Creating quiz...
  ✅ Created quiz: Daily Life Quiz
  🔗 Linking blocks to lesson...
  ✅ Linked 3 blocks to lesson

✅ Successfully seeded: Daily Life & Routines
```

## 🎯 Database Collections Created

- `words` - 150 documents
- `flashcards` - 150 documents
- `carddecks` - 10 documents
- `contentblocks` - 30 documents (grammar, vocabulary, media)
- `lessons` - 10 documents
- `quizzes` - 10 documents
- `categories` - 1 document (General English)

## 🧪 Testing Individual Topics

You can test seed data for a single topic:

```javascript
// In seedComprehensive.js
const { topic1_dailyLife } = require("../models/seeds/comprehensive.seed");

// Seed only Topic 1
const result = await seedTopic(topic1_dailyLife, categoryId);
console.log(result);
```

## 🔍 Verification

After seeding, verify in MongoDB:

```javascript
// Check counts
db.words.countDocuments() // Should be 150
db.flashcards.countDocuments() // Should be 150  
db.carddecks.countDocuments() // Should be 10
db.contentblocks.countDocuments() // Should be 30
db.lessons.countDocuments() // Should be 10
db.quizzes.countDocuments() // Should be 10

// Check sample data
db.lessons.findOne({ title: "Daily Life and Routines" })
db.words.find({ tags: "daily-life" }).limit(5)
```

## 🎨 Customization

To add more topics or modify existing ones:

1. Copy a topic template from any seed file
2. Modify the topic data (words, blocks, etc.)
3. Add to `comprehensiveSeedData` array in `comprehensive.seed.js`
4. Run seed script

## ⚠️ Important Notes

- Script will create a "General English" category if it doesn't exist
- All seed data uses STATUS.ACTIVE status
- YouTube videos are real embed URLs
- Vietnamese translations included for all content
- Quiz questions include vietnamese explanations

## 📌 Field Requirements

### Words (15 per topic)
- word, pronunciation, partOfSpeech, level, definitions[], tags[], createdBy

### Card Deck
- title, description, level, difficulty, categoryId, status

### Blocks
- **Grammar**: topic, explanation, examples[], videoUrl, sourceType
- **Vocabulary**: references cardDeck
- **Media**: mediaType, sourceUrl, transcript, tasks[]

### Lesson
- title, description, skill, topic, level, duration_minutes, blocks[], categoryId

### Quiz
- title, skill, difficulty, xpReward, attachedTo{}, questions[]

## 🐛 Troubleshooting

**Error: Category not found**
- The script will auto-create "General English" category

**Error: Duplicate keys**
- Clear database before reseeding: `db.dropDatabase()`

**Error: Connection timeout**
- Check MongoDB is running: `mongod --version`

## 📞 Support

For questions or issues, check:
- Database connection in `.env`
- MongoDB service status
- Console logs during seeding

---
**Created**: 2026-01-06  
**Total Data Points**: 360+ (words, flashcards, blocks, lessons, quizzes)
