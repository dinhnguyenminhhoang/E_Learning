export interface Mission {
  id: string;
  type: "daily" | "review";
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: string;
  locked?: boolean;
  requirement?: string;
}

export interface Topic {
  id: string;
  name: string;
  progress: number;
  total: number;
  icon: string;
}

export interface WordLevel {
  level: string;
  count: number;
  label: string;
}
export interface Block {
  _id: string;
  type: "vocabulary" | "grammar" | "quiz" | "media" | "video";
  title?: string;
  description?: string;
  skill: string;
  difficulty?: string;
  lessonId?: string;
  status?: string;
  mediaType?: string;
  sourceType?: string;
  sourceUrl?: string;
  transcript?: string;
  tasks?: any[];
  topic?: string;
  explanation?: string;
  examples?: string[];
  videoUrl?: string;
  exercise?: string; // quiz id attached to block/lesson
  isQuiz?: boolean; // has quiz attached (backend startBlock response)
}

export interface SubTopic {
  id: string;
  name: string;
  progress: number;
  total: number;
  icon: string;
  blocks?: Block[];
  isCompleted?: boolean;
  isLearned?: boolean;
  lastAccessedAt?: string | null;
  completedAt?: string | null;
  isLocked?: boolean;
}

export interface TopicList {
  id: number;
  name: string;
  totalTopics: number;
  progressPercent: number;
  subTopics: SubTopic[];
}
export interface Word {
  id: string;
  word: string;
  status: "not-learned" | "learning" | "mastered";
}

export interface GameType {
  id: string;
  name: string;
  enabled: boolean;
}

export interface TopicDetailData {
  id: string;
  name: string;
  icon: string;
  progress: number;
  total: number;
  words: Word[];
}
export type LessonWord = {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example?: string;
  image?: string;
};

export interface LearningPath {
  _id: string;
  target: string;
  key: string;
  title: string;
  description?: string;
  level: string;
  levels: Array<{
    order: number;
    title: string;
    lessons: Array<{
      lesson: string;
      order: number;
    }>;
    finalQuiz?: string;
  }>;
  status: string;
}

export interface LearningPathHierarchyParams {
  learningPathId: string;
  isLevel?: boolean;
  isLesson?: boolean;
  isBlock?: boolean;
  levelOrder?: number;
  lessonId?: string;
}

export interface UserLearningPath {
  _id: string;
  userId: string;
  learningPathId: string;
  currentLevel: number;
  completedLessons: string[];
  progress: number;
  startedAt: Date;
  lastAccessedAt: Date;
  status: string;
}

// User Overview/Dashboard Types
export interface RecentLesson {
  id: string;
  title: string;
  topic: string;
  skill: string;
  isCompleted: boolean;
  progressPercentage: number;
  lastAccessedAt: string;
}

export interface VocabularyLevelStats {
  level: string;
  count: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  link: string;
}

export interface UserOverview {
  hasLearningPath: boolean;
  message?: string;
  user?: {
    name: string;
    currentLevel: number;
    streak: number;
  };
  dailyProgress?: {
    goal: number;
    completed: number;
    percentage: number;
  };
  learningPath?: {
    id: string;
    title: string;
    description: string;
    totalLevels: number;
    currentLevel: number;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  };
  recentLessons?: RecentLesson[];
  vocabularyStats?: {
    totalWords: number;
    byLevel: VocabularyLevelStats[];
  };
  quickActions?: QuickAction[];
}
