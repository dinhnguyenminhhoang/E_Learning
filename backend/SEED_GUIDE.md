# 🌱 Real Data Seed Guide - 10 Topics

## 📚 Topics Included (150 Real Words)

1. **Daily Routines & Habits** (Beginner - Reading)
   - wake up, breakfast, commute, shower, brush, schedule, etc.

2. **Shopping & Money** (Beginner - Speaking)
   - purchase, receipt, discount, refund, budget, bargain, etc.

3. **Travel & Transportation** (Intermediate - Speaking)
   - destination, passport, luggage, boarding, ticket, etc.

4. **Food & Dining** (Beginner - Speaking)
   - menu, appetizer, dessert, waiter, order, chef, etc.

5. **Health & Medicine** (Intermediate - Reading)
   - symptoms, prescription, appointment, fever, cough, etc.

6. **Technology & Internet** (Intermediate - Reading)
   - download, upload, password, browser, software, etc.

7. **Work & Office** (Intermediate - Speaking)
   - colleague, meeting, deadline, presentation, salary, etc.

8. **Weather & Nature** (Beginner - Reading)
   - sunny, rainy, cloudy, windy, temperature, storm, etc.

9. **Family & Relationships** (Beginner - Speaking)
   - parents, sibling, relative, cousin, aunt, uncle, etc.

10. **Hobbies & Entertainment** (Beginner - Speaking)
    - hobby, painting, reading, photography, cooking, etc.

## 🚀 Quick Start

### Step 1: Clear old data (OPTIONAL)
```bash
cd backend
node src/scripts/clearAllData.js
```

### Step 2: Seed new data
```bash
node src/scripts/seedReal10Topics.js
```

## 📊 What Gets Created

For each topic (10 total):
- ✅ **15 Real Words** with accurate definitions
- ✅ **1 Card Deck** for vocabulary
- ✅ **15 Flashcards** linked to words
- ✅ **3 Content Blocks**:
  - Grammar Block (with grammar explanation)
  - Vocabulary Block (linked to deck)
  - Media Block (video placeholder)
- ✅ **1 Lesson** with all blocks
- ✅ **1 Quiz** with 5 questions

**Total Created:**
- 150 Words
- 10 Card Decks
- 150 Flashcards
- 30 Content Blocks
- 10 Lessons
- 10 Quizzes

## ✨ Features

### Real Vocabulary
- Authentic English words with accurate:
  - Pronunciation (IPA format)
  - Part of speech
  - English & Vietnamese meanings
  - Example sentences (English & Vietnamese)
  - Level (beginner/intermediate/advanced)
  - Tags for categorization

### Grammar Topics
Each topic includes real grammar lessons:
- Present Simple (Daily Routines)
- Modal Verbs (Shopping)
- Future Tense (Travel)
- Countable/Uncountable Nouns (Food)
- Imperative Sentences (Health)
- Passive Voice (Technology)
- Reported Speech (Work)
- Comparatives & Superlatives (Weather)
- Possessive Pronouns (Family)
- Gerunds & Infinitives (Hobbies)

## 🔧 Customization

### Change User ID
Edit `src/scripts/seedReal10Topics.js`:
```javascript
const userId = "YOUR_USER_ID_HERE";
```

### Add More Topics
1. Edit `src/models/seeds/real10Topics.seed.js`
2. Add new topic object (follow existing pattern)
3. Add to `allTopics` array in seed script

## 📝 Verification

After seeding, check in MongoDB:

```javascript
// Check counts
db.words.countDocuments()        // Should be 150
db.carddecks.countDocuments()    // Should be 10
db.flashcards.countDocuments()   // Should be 150
db.contentblocks.countDocuments() // Should be 30
db.lessons.countDocuments()      // Should be 10
db.quizzes.countDocuments()      // Should be 10

// View sample data
db.words.find({ tags: "daily-routine" }).limit(5)
db.lessons.findOne({ title: "Daily Routines & Habits" })
```

## 🎯 Database Structure

```
Category (General English)
  ↓
Lesson (Daily Routines & Habits)
  ↓
Blocks:
  - Grammar Block (Present Simple)
  - Vocabulary Block → Card Deck → Flashcards → Words
  - Media Block (Video)
  ↓
Quiz (5 questions)
```

## ⚠️ Important Notes

- All data uses STATUS.ACTIVE
- Vietnamese translations included
- Real pronunciation guides (IPA format)
- Realistic example sentences
- Proper difficulty levels
- Category "General English" auto-created if not exists

## 🐛 Troubleshooting

**Error: MongoDB connection failed**
```bash
# Check .env file has MONGODB_URI
MONGODB_URI=mongodb://localhost:27017/e-learning
```

**Error: User ID not found**
```bash
# Use any valid ObjectId format
const userId = "68d6b94dcbcf0248cdca3d99";
```

**Want to re-seed**
```bash
# Clear old data first
node src/scripts/clearAllData.js

# Then seed again
node src/scripts/seedReal10Topics.js
```

## 📞 Next Steps

After seeding:
1. ✅ Check frontend - words should appear
2. ✅ Test flashcard creation - should link to real words
3. ✅ Test lessons - blocks should be populated
4. ✅ Test quizzes - questions should work

---

**Created:** 2026-01-06
**Total Words:** 150 real English words
**Quality:** Production-ready authentic data
