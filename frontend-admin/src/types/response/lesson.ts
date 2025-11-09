export interface LessonBlock {
  _id: string;
  block: string;
  exercise: string | null;
  order: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  skill: string;
  topic: string;
  level: string;
  duration_minutes: number;
  order?: number;
  prerequisites: string[];
  status: string;
  categoryId: string | null;
  blocks: LessonBlock[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  thumbnail?: string;
}

export interface LessonBody {
  title: string;
  description: string;
  skill: string;
  topic: string;
  level: string;
  duration_minutes: number;
  categoryId: string;
  prerequisites?: string[];
}

export interface LessonUpdateBody {
  title: string;
  description: string;
  skill: string; // ví dụ: "reading", "writing", "listening", "speaking"
  topic: string; // ví dụ: "ReactJS"
  level: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  thumbnail: string; // URL ảnh
  prerequisites: string[]; // danh sách id bài học hoặc điều kiện trước
  categoryId: string; // id của danh mục
  status: string; // trạng thái bài học
  blocks: {
    block: string; // id block
    exercise: string; // id bài tập
    order: number; // thứ tự trong bài học
  }[];
}
