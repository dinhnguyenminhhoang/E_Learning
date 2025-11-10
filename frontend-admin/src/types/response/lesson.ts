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