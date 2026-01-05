# Flashcards Management - Migration Guide

## 📋 Overview

This guide covers the migration of Flashcards and CardDecks to include new tracking and statistics fields.

## 🆕 New Fields Added

### FlashCard Model
- **Media Fields:**
  - `images` - Array of image URLs
  - `audio` - Audio file URL for pronunciation
  - `hint` - Hint text (max 500 chars)
  - `explanation` - Detailed explanation (max 1000 chars)

- **Statistics:**
  - `viewCount` - Number of times viewed (default: 0)
  - `studyCount` - Number of times studied (default: 0)

- **User Tracking:**
  - `createdBy` - User who created the flashcard (ObjectId)
  - `updatedBy` - Updated to ObjectId (was String)

### CardDeck Model
- **Classification:**
  - `tags` - Array of tags for categorization
  - `difficulty` - Difficulty level: easy/medium/hard (default: medium)
  - `isPublic` - Whether deck is public (default: true)

- **Statistics:**
  - `viewCount` - Number of times viewed (default: 0)
  - `studyCount` - Number of times studied (default: 0)
  - `cardCount` - Number of flashcards in deck (default: 0)

- **User Tracking:**
  - `createdBy` - User who created the deck (ObjectId)
  - `updatedBy` - Updated to ObjectId (was String)

---

## 🚀 Running the Migration

### Prerequisites
- Node.js and npm installed
- MongoDB running
- `.env` file configured with `MONGO_URI`

### Steps

1. **Backup your database first!**
   ```bash
   mongodump --uri="your_mongodb_uri" --out=/path/to/backup
   ```

2. **Run the migration script:**
   ```bash
   cd /home/detdev/workspace/E_Learning
   node backend/scripts/migrate-flashcards-fields.js
   ```

3. **Review the output:**
   The script will show:
   - Number of documents matched
   - Number of documents modified
   - Verification statistics
   - Success/failure status

### Expected Output
```
╔═══════════════════════════════════════════════════════╗
║   Flashcards & CardDecks Migration Script            ║
╚═══════════════════════════════════════════════════════╝

🔗 Connecting to MongoDB: mongodb://...
✅ Connected to MongoDB

🔄 Starting FlashCard migration...
✅ FlashCard migration completed:
   - Matched: 150 documents
   - Modified: 150 documents

🔄 Starting CardDeck migration...
✅ CardDeck migration completed:
   - Matched: 25 documents
   - Modified: 25 documents

🔄 Updating card counts for all decks...
✅ Card count update completed:
   - Total decks: 25
   - Updated: 25 decks

🔍 Verifying migration...
📊 Verification Results:

FlashCards:
   Total: 150
   With viewCount: 150 (100.0%)
   With studyCount: 150 (100.0%)

CardDecks:
   Total: 25
   With viewCount: 25 (100.0%)
   With studyCount: 25 (100.0%)
   With cardCount: 25 (100.0%)
   With isPublic: 25 (100.0%)
   With difficulty: 25 (100.0%)

✅ Migration completed successfully!
```

---

## 📡 New API Endpoints

### Flashcard Statistics

#### Increment View Count
```http
POST /v1/api/flashcard/:id/increment-view
```

#### Increment Study Count
```http
POST /v1/api/flashcard/:id/increment-study
```

#### Get Flashcard (with optional view increment)
```http
GET /v1/api/flashcard/getById/:id?incrementView=true
```

### CardDeck Statistics

#### Increment View Count
```http
POST /v1/api/card-deck/:cardDeckId/increment-view
Authorization: Bearer <token>
```

#### Increment Study Count
```http
POST /v1/api/card-deck/:cardDeckId/increment-study
Authorization: Bearer <token>
```

#### Update Card Count
```http
POST /v1/api/card-deck/:cardDeckId/update-card-count
Authorization: Bearer <token>
```

#### Get CardDeck (with optional view increment)
```http
GET /v1/api/card-deck/:cardDeckId?incrementView=true
Authorization: Bearer <token>
```

---

## 💻 Usage Examples

### Backend - Auto-set createdBy
```javascript
// In controller (automatic)
const userId = req.user?._id || req.userId;
const flashcard = await flashcardService.createFlashcard(req.body, userId);
// createdBy is automatically set
```

### Backend - Track Views
```javascript
// Increment view when user views a card
await flashcard.incrementView();

// Or through service
await flashcardService.incrementFlashcardView(flashcardId);
```

### Backend - Track Study Sessions
```javascript
// Increment study when user completes studying
await flashcard.incrementStudy();
await cardDeck.incrementStudy();
```

### Frontend - Call Statistics API
```typescript
import { flashcardAdminService } from '@/services/flashcardAdmin.service';

// When user opens a deck
await flashcardAdminService.getById(deckId, true); // incrementView=true

// Or manually increment
await flashcardAdminService.incrementCardDeckView(deckId);

// Track study completion
await flashcardAdminService.incrementFlashcardStudy(cardId);
await flashcardAdminService.incrementCardDeckStudy(deckId);

// Update card count after adding/removing cards
await flashcardAdminService.updateCardDeckCardCount(deckId);
```

### Frontend - Create Flashcard with Media
```typescript
const newCard = {
  word: wordId,
  frontText: "What is React?",
  backText: "A JavaScript library",
  cardDeck: deckId,
  difficulty: "medium",
  tags: ["javascript", "react"],

  // New media fields
  images: [
    "https://example.com/react-logo.png",
    "https://example.com/react-diagram.jpg"
  ],
  audio: "https://example.com/pronunciation.mp3",
  hint: "It's maintained by Meta (Facebook)",
  explanation: "React is a declarative, component-based library for building user interfaces."
};

await flashcardAdminService.createFlashcard(newCard);
```

---

## 🔍 Query Examples

### Get Popular Flashcards
```javascript
// Most studied cards (uses index)
const popular = await FlashCard.find({ status: 'active' })
  .sort({ studyCount: -1, viewCount: -1 })
  .limit(10)
  .populate('word cardDeck createdBy');
```

### Get Popular Decks
```javascript
// Most studied decks (uses index)
const popular = await CardDeck.find({ status: 'active' })
  .sort({ studyCount: -1, viewCount: -1 })
  .limit(10);
```

### Filter by Difficulty and Tags
```javascript
// Find hard difficulty decks with specific tags
const decks = await CardDeck.find({
  difficulty: 'hard',
  isPublic: true,
  tags: { $in: ['javascript', 'react'] },
  status: 'active'
});
```

### Get User's Decks
```javascript
// Find decks created by specific user
const myDecks = await CardDeck.find({
  createdBy: userId,
  status: 'active'
}).populate('createdBy', 'name email avatar');
```

---

## ⚠️ Important Notes

### Backward Compatibility
- Old flashcards/decks without new fields will get default values after migration
- Existing API endpoints continue to work
- New fields are optional in update operations

### Performance Considerations
- New indexes added for statistics queries:
  - `{ studyCount: -1, viewCount: -1 }` - For popular content
  - `{ createdBy: 1, status: 1 }` - For user content
  - `{ tags: 1 }` - For tag filtering

### Auto-population
Repositories now automatically populate:
- `createdBy` and `updatedBy` with `name`, `email`, `avatar`
- `word` with `pronunciation`, `audio`, `partOfSpeech`
- `cardDeck` with `difficulty`, `level`

---

## 🐛 Troubleshooting

### Migration fails with "Connection timeout"
- Check MongoDB is running: `mongosh`
- Verify MONGO_URI in `.env`
- Check network/firewall settings

### Some documents not migrated
- Check the migration output for "Matched" vs "Modified" count
- Re-run the migration (it's idempotent)
- Check document status field

### Statistics not incrementing
- Verify user is authenticated (for CardDeck endpoints)
- Check route definitions in routes files
- Test endpoints with Postman/curl

---

## 📚 Next Steps

1. **Test New Features:**
   - Create flashcards with media fields
   - Test statistics tracking
   - Verify user tracking works

2. **Update Frontend UI:**
   - Display view/study counts
   - Show creator information
   - Add form fields for images, audio, hints
   - Add tags and difficulty filters

3. **Monitor Performance:**
   - Check query performance with new indexes
   - Monitor statistics update frequency
   - Adjust caching strategy if needed

4. **Documentation:**
   - Update API docs with new endpoints
   - Add examples to Swagger/Postman collection
   - Document frontend component usage

---

## 📞 Support

If you encounter issues:
1. Check the migration script logs
2. Verify database indexes: `db.flashcards.getIndexes()`
3. Test endpoints with sample data
4. Review error logs in backend console

---

**Last Updated:** January 2026
**Version:** 2.0.0
