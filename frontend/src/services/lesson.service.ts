import { apiClient } from "@/config/api.config";

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  skill: string;
  topic: string;
  level: string;
  duration_minutes?: number;
  thumbnail?: string;
  categoryId: string;
  blocks: Array<{
    block: string;
    exercise?: string;
    order: number;
  }>;
  status: string;
}

export interface Block {
  _id: string;
  type: string;
  title?: string;
  description?: string;
  skill: string;
  difficulty: string;
  lessonId?: string;
  status: string;
}

class LessonService {
  async attachQuizToLesson(data: {
    lessonId: string;
    quizId: string;
    blockId?: string;
  }) {
    return await apiClient.post("/v1/api/lesson/attach-quiz", data);
  }

  async detachQuizFromLesson(data: { lessonId: string; quizId: string }) {
    return await apiClient.post("/v1/api/lesson/detach-quiz", data);
  }

  async getAllLessons(query?: any) {
    return await apiClient.get("/v1/api/lesson/", { params: query });
  }

  async createLesson(data: Partial<Lesson>) {
    return await apiClient.post("/v1/api/lesson/", data);
  }

  async getLessonById(lessonId: string, userId: string) {
    return await apiClient.get(`/v1/api/lesson/${lessonId}/user/${userId}`);
  }

  async deleteLesson(lessonId: string) {
    return await apiClient.delete(`/v1/api/lesson/${lessonId}`);
  }

  async updateLesson(lessonId: string, data: Partial<Lesson>) {
    return await apiClient.put(`/v1/api/lesson/${lessonId}`, data);
  }

  async assignBlockToLesson(
    lessonId: string,
    data: {
      blockId: string;
      order: number;
    }
  ) {
    return await apiClient.post(`/v1/api/lesson/${lessonId}/blocks`, data);
  }

  async createBlock(data: Partial<Block>) {
    return await apiClient.post("/v1/api/lesson/blocks", data);
  }

  async updateBlock(blockId: string, data: Partial<Block>) {
    return await apiClient.put(`/v1/api/lesson/blocks/${blockId}`, data);
  }

  async deleteBlock(blockId: string) {
    return await apiClient.delete(`/v1/api/lesson/blocks/${blockId}`);
  }

  async markLessonComplete(lessonId: string) {
    return await apiClient.post(`/v1/api/lesson/${lessonId}/complete`);
  }
}

export const lessonService = new LessonService();
