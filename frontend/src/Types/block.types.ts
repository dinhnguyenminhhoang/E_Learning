// ===== Lesson Content Types =====

export interface WordDefinition {
  meaning: string;
  meaningVi: string;
  examples?: Array<{
    sentence: string;
    translation?: string;
  }>;
}

export interface WordInfo {
  _id: string;
  word: string;
  pronunciation?: string;
  audio?: string;
  partOfSpeech?: string;
  definitions: WordDefinition[];
  level?: string;
  image?: string;
  synonyms?: string[];
  antonyms?: string[];
  tags?: string[];
}

export interface Flashcard {
  _id: string;
  frontText: string;
  backText: string;
  difficulty: string;
  tags: string[];
  word: WordInfo | null;
}

export interface CardDeckInfo {
  _id: string;
  title: string;
  description?: string;
  level?: string;
  thumbnail?: string;
  target?: any;
  categoryId?: any;
}

export interface BlockData {
  _id: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: number;
  order?: number;
  explanation?: string;
  examples?: string[];
}

// Union type for lesson content
export type LessonContent =
  | {
      type: "video" | "media";
      blockData: BlockData;
    }
  | {
      type: "vocabulary";
      cardDeck: CardDeckInfo;
      flashcards: Flashcard[];
    }
  | {
      type: "grammar" | "quiz" | string;
      blockData: BlockData;
    };

export interface StartBlockResponse {
  status: string;
  message: string;
  data: {
    blockId: string;
    lessonId: string;
    learningPathId: string;
    isCompleted: boolean;
    maxWatchedTime: number;
    videoDuration: number;
    lastAccessedAt?: string;
    lessonContent: LessonContent | null;
  };
  code: number;
}

export interface VideoHeartbeatResponse {
  status: string;
  message: {
    message: string;
    data: {
      isCompleted: boolean;
      isLearned: boolean;
      maxWatchedTime: number;
      videoDuration: number;
      progressPercentage: number;
    };
  };
  data: null;
  code: number;
}

export interface QuizQuestion {
  _id: string;
  sourceType: string;
  sourceId: string;
  type: string;
  questionText: string;
  options: Array<{ text: string }>;
  points: number;
  explanation: string;
  correctAnswer?: string | null;
  tags?: string[];
  thumbnail?: string | null;
  audio?: string | null;
}

export interface QuizAttempt {
  _id: string;
  user: string;
  quiz: {
    _id: string;
    title: string;
    questions: QuizQuestion[];
    xpReward: number;
    difficulty: string;
    status: string;
  };
  block: string;
  userBlockProgress: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  isPassed: boolean;
  timeSpent: number;
  status: string;
  completedAt: string | null;
  updatedAt: string;
  updatedBy: string | null;
  answers: any[];
  startedAt: string;
  createdAt: string;
}

export interface StartQuizResponse {
  status: string;
  message: string;
  data: {
    attempt?: QuizAttempt;
    quiz?: QuizAttempt["quiz"];
    hasExercise?: boolean;
    blockCompleted?: boolean;
    message?: string;
  };
  code: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  timeSpent?: number;
}

export interface SubmitQuizResponse {
  status: string;
  message: string;
  data: {
    attempt: QuizAttempt;
    isBlockCompleted: boolean;
  };
  code: number;
}
