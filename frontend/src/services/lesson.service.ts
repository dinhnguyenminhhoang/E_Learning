import { Lesson, CreateLessonInput } from "@/types/admin";

// Mock data
const MOCK_LESSONS: Lesson[] = [
  {
    _id: "lesson-1",
    title: "Irregular Plural Nouns #1",
    description: "Learn about irregular plural forms in English",
    topic: "Grammar",
    skill: "reading",
    difficulty: "beginner",
    order: 1,
    blocks: [
      { _id: "block-1", type: "media", title: "Introduction Video", order: 1 },
      { _id: "block-2", type: "grammar", title: "Grammar Explanation", order: 2 },
      { _id: "block-3", type: "vocabulary", title: "Key Vocabulary", order: 3 },
      { _id: "block-4", type: "quiz", title: "Practice Quiz", order: 4 },
    ],
    status: "published",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "lesson-2",
    title: "Daily Greetings",
    description: "Common phrases for greeting people",
    topic: "Communication",
    skill: "speaking",
    difficulty: "beginner",
    order: 2,
    blocks: [
      { _id: "block-5", type: "media", title: "Greeting Scenarios", order: 1 },
      { _id: "block-6", type: "vocabulary", title: "Common Greetings", order: 2 },
    ],
    status: "published",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    _id: "lesson-3",
    title: "Business Email Writing",
    description: "Professional email communication",
    topic: "Writing",
    skill: "writing",
    difficulty: "intermediate",
    order: 3,
    blocks: [
      { _id: "block-7", type: "grammar", title: "Formal Writing Structure", order: 1 },
      { _id: "block-8", type: "vocabulary", title: "Business Vocabulary", order: 2 },
    ],
    status: "draft",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-05"),
  },
];

class LessonService {
  private lessons: Lesson[] = [...MOCK_LESSONS];

  async getAll(): Promise<{ code: number; data: Lesson[] }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      code: 200,
      data: this.lessons,
    };
  }

  async getById(id: string): Promise<{ code: number; data: Lesson | null }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const lesson = this.lessons.find((l) => l._id === id);
    return {
      code: lesson ? 200 : 404,
      data: lesson || null,
    };
  }

  async create(
    input: CreateLessonInput
  ): Promise<{ code: number; data: Lesson }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newLesson: Lesson = {
      _id: `lesson-${Date.now()}`,
      ...input,
      order: this.lessons.length + 1,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.push(newLesson);
    return {
      code: 201,
      data: newLesson,
    };
  }

  async update(
    id: string,
    input: Partial<CreateLessonInput>
  ): Promise<{ code: number; data: Lesson | null }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.lessons.findIndex((l) => l._id === id);
    if (index === -1) {
      return { code: 404, data: null };
    }

    this.lessons[index] = {
      ...this.lessons[index],
      ...input,
      updatedAt: new Date(),
    };

    return {
      code: 200,
      data: this.lessons[index],
    };
  }

  async delete(id: string): Promise<{ code: number; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.lessons.findIndex((l) => l._id === id);
    if (index === -1) {
      return { code: 404, message: "Lesson not found" };
    }

    this.lessons.splice(index, 1);
    return {
      code: 200,
      message: "Lesson deleted successfully",
    };
  }
}

export const lessonService = new LessonService();
