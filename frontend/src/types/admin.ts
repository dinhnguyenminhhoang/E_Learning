
export interface Category {
  _id: string;
  name: string;
  nameVi: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  nameVi: string;
  slug?: string; // Optional - backend auto-generates
  description?: string;
  status: "active" | "inactive";
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  _id: string;
}

// Lesson types
export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  topic: string;
  skill: "reading" | "writing" | "listening" | "speaking";
  difficulty: "beginner" | "intermediate" | "advanced";
  order: number;
  blocks?: Block[];
  status: "draft" | "active" | "archived"; // Fixed: backend uses 'active' not 'published'
  createdAt: Date;
  updatedAt: Date;
}

export interface Block {
  _id: string;
  type: "vocabulary" | "grammar" | "quiz" | "media";
  title: string;
  order: number;
}

export interface CreateLessonInput {
  title: string;
  
  // Joi: allow(null, "").optional()
  description?: string; 
  
  topic: string;
  
  skill: "reading" | "writing" | "listening" | "speaking";
  
  // UPDATE 1: Đổi từ 'difficulty' sang 'level' để khớp backend
  level: "beginner" | "intermediate" | "advanced";
  
  // UPDATE 2: Thêm trường bắt buộc này
  categoryId: string; 
  
  // UPDATE 3: Thêm duration (optional vì backend có default=30)
  duration_minutes?: number;
  
  // UPDATE 4: Thêm prerequisites (optional vì backend có default=[])
  prerequisites?: string[];

}
export interface UpdateLessonInput extends Partial<CreateLessonInput> {
  _id: string;
}

// Learning Path types
export interface Target {
  _id: string;
  key: string;
  name: string;
  description?: string;
  tags?: string[];
  learningPaths?: string[];
  status: string;
  createdAt: Date;
}

export interface LearningPath {
  _id: string;
  title: string;
  description?: string;
  target: string | Target; // Can be either ID or populated object
  key: string;
  level: "beginner" | "intermediate" | "advanced";
  levels: PathLevel[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface PathLevel {
  order: number;
  title: string;
  lessons: { lesson: string; order: number }[];
  finalQuiz?: string;
}

export interface CreateLearningPathInput {
  title: string;
  description?: string;
  target: string;
  targetId?: string;
  key: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
}

// Quiz types - Aligned with backend/src/models/Quiz.js and actual data
export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  sourceType?: "Word" | "Flashcard" | "CardDeck" | null;
  sourceId?: string | null;
  type:
    | "multiple_choice"
    | "fill_blank"
    | "matching"
    | "true_false"
    | "writing"
    | "speaking";
  questionText: string;
  question?: string; // Legacy field for backward compatibility
  options: QuizOption[];
  correctAnswer?: string | null;
  explanation?: string | null;
  points: number;
  tags: string[];
  thumbnail?: string | null;
  audio?: string | null;
  status?: string;
  matchingPair?: MatchingPair[] ; // For matching questions
}

export interface MatchingPair {
  left: Record<string, any>;
  right: Record<string, any>;
}
export interface Quiz {
  _id: string;
  title: string;
  skill?:
    | "reading"
    | "listening"
    | "writing"
    | "speaking"
    | "grammar"
    | "vocabulary"
    | string;
  type?:
    | "multiple_choice"
    | "fill_blank"
    | "matching"
    | "true_false"
    | "writing"
    | "speaking";
  attachedTo?: {
    kind: "Lesson" | "Module" | "LearningPath" | "Block";
    item: string;
  };
  questions: Question[];
  xpReward: number;
  difficulty: string; // Can be EASY/MEDIUM/HARD or beginner/intermediate/advanced
  status: string;
  updatedAt?: string | Date;
  updatedBy?: string | null;
  createdAt: string | Date;
}

export interface CreateQuizInput {
  title: string;
  skill:
    | "reading"
    | "listening"
    | "writing"
    | "speaking"
    | "grammar"
    | "vocabulary";
  difficulty: string;
  attachedTo?: {
    kind: "Lesson" | "Module" | "LearningPath" | "Block";
    item: string;
  };
  xpReward?: number;
  status?: string;
}

// User types
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar?: string;
  status: "active" | "inactive";
  learningPathsCount: number;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  status: "active" | "inactive";
}

// Flashcard types
export interface CardDeck {
  _id: string;
  title: string; // Backend uses title
  name?: string; // Keep for backward compatibility if needed
  description?: string;
  category?: string; // ID or name depending on usage
  categoryId?: { _id: string; name: string }; // Populated category
  thumbnail?: string;
  level?: "beginner" | "intermediate" | "advanced";
  difficulty?: "easy" | "medium" | "hard";
  target?: { _id: string; name: string };
  tags?: string[];
  isPublic?: boolean;
  viewCount?: number;
  studyCount?: number;
  cardCount?: number;
  cards?: FlashCard[];
  status: "active" | "inactive";
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashCard {
  _id: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  difficulty: number;
  tags: string[];
}

export interface CreateCardDeckInput {
    title: string;
    description?: string;
    category?: string;
    categoryId?: string;
    level?: "beginner" | "intermediate" | "advanced";
    difficulty?: "easy" | "medium" | "hard";
    thumbnail?: string;
    tags?: string[];
    isPublic?: boolean;
    status?: 'active' | 'inactive';
}
