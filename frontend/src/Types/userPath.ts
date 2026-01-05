// 1. Định nghĩa cho Level và Lesson bên trong LearningPath
export interface PathLesson {
  _id: string;
  lesson: string; // ObjectId của bài học thực tế
  order: number;
}

export interface PathLevel {
  _id?: string;
  order: number;
  title: string;
  lessons: PathLesson[];
  finalQuiz?: string; // ObjectId của bài kiểm tra
}

// 2. Định nghĩa chi tiết LearningPath (đã được populate)
export interface LearningPath {
  _id: string;
  key: string;
  title: string;
  level: string; // VD: 'BEGINNER', 'INTERMEDIATE'
  target: string; // ObjectId của Target nằm trong LearningPath
  levels: PathLevel[];
  status: string;
  updatedAt: string;
  description?: string;
}

// 3. Định nghĩa chi tiết Target (đã được populate)
export interface Target {
  _id: string;
  key: string;
  name: string;
  description: string;
  status: string;
}

// 4. Định nghĩa Progress (Tiến độ học)
export interface LearningProgress {
  currentLevel: number;
  currentLesson: number;
  completedLessons: string[]; // Mảng các ObjectId bài học đã xong
  startedAt: string;
  updatedAt: string;
}

// 5. Định nghĩa UserLearningPath (Object chính trong data)
export interface UserLearningPath {
  _id: string;
  user: string; // ObjectId của User

  // Khóa học hiện tại (đã populate)
  learningPath: LearningPath;

  // Danh sách các khóa học (đã populate)
  listPath: LearningPath[];

  // Mục tiêu (đã populate)
  target: Target;

  status: "active" | "paused" | "abandoned" | "completed";
  progress: LearningProgress;

  dailyGoal: number;
  lastAccAt: string; // ISO Date string
  weakWords: string[];
  totalTimeSpent: number;
  averageSessionTime: number;

  updatedAt: string;
  createdAt: string;
}

// 6. Định nghĩa trọn bộ API Response
export interface UserLearningPathResponse {
  status: string; // VD: "success"
  message: string; // VD: "Fetched user learning paths"
  data: UserLearningPath[]; // Lưu ý: Dựa trên JSON của bạn, data đang là mảng
  code: number; // VD: 200
  timestamp: string;
}

export interface SimplePath {
  _id: string;
  title: string;
  description?: string;
}
