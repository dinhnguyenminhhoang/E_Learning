export const WORD_REQUIRED_HEADERS = [
  "word",
  "pronunciation",
  "audio",
  "partOfSpeech",
  "level",
  "frequency",
  "categories",
  "tags",
  "image",
  "difficulty",
  "isActive",
];

export const dataSample = [
  {
    word: 'walk',
    pronunciation: '/wɔːk/',
    audio: 'https://example.com/audio/walk.mp3',
    partOfSpeech: 'verb',
    level: 'beginner',
    frequency: 10,
    categories: '68d944d2167c80c74b999da5',
    tags: 'daily; verb',
    image: 'https://example.com/images/walk.png',
    difficulty: 2,
    isActive: true
  },
  {
    word: 'run',
    pronunciation: '/rʌn/',
    audio: 'https://example.com/audio/run.mp3',
    partOfSpeech: 'verb',
    level: 'intermediate',
    frequency: 25,
    categories: '68d944d2167c80c74b999da5',
    tags: 'daily; sport',
    image: 'https://example.com/images/run.png',
    difficulty: 3,
    isActive: true
  }
];