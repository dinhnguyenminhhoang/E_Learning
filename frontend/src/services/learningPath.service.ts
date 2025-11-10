import { apiClient } from "@/config/api.config";

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
}

class LearningPathService {
  async createNewPath(data: Partial<LearningPath>) {
    return await apiClient.post("/v1/api/learning-path/", data);
  }

  async attachQuizToLevel(data: {
    learningPathId: string;
    levelOrder: number;
    quizId: string;
  }) {
    return await apiClient.post("/v1/api/learning-path/attach-quiz", data);
  }

  async updateQuizInLevel(data: {
    learningPathId: string;
    levelOrder: number;
    newQuizId: string;
  }) {
    return await apiClient.put(
      "/v1/api/learning-path/update-quiz-in-level",
      data
    );
  }

  async removeQuizFromLevel(data: {
    learningPathId: string;
    levelOrder: number;
  }) {
    return await apiClient.delete(
      "/v1/api/learning-path/remove-quiz-from-level",
      { data }
    );
  }

  async assignLessonToPath(
    learningPathId: string,
    data: {
      titleLevel: string;
      lessonId: string;
      order?: number;
    }
  ) {
    return await apiClient.post(
      `/v1/api/learning-path/${learningPathId}/assign`,
      data
    );
  }

  async createNewLevel(learningPathId: string, data: { title: string }) {
    return await apiClient.post(
      `/v1/api/learning-path/level/${learningPathId}`,
      data
    );
  }

  async getAllPath() {
    return await apiClient.get("/v1/api/learning-path/");
  }

  async getLearningPathHierarchy(query: {
    learningPathId: string;
    isLevel?: boolean;
    isLesson?: boolean;
    isBlock?: boolean;
    levelOrder?: number;
    lessonId?: string;
  }) {
    return await apiClient.get("/v1/api/learning-path/hierarchy", {
      params: query,
    });
  }
}

export const learningPathService = new LearningPathService();
