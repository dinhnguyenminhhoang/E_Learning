import { apiClient } from "@/config/api.config";
import { LearningPath, LearningPathHierarchyParams } from "@/types/learning";

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

  async getLearningPathHierarchy(params: LearningPathHierarchyParams) {
    return await apiClient.get("/v1/api/learning-path/hierarchy", {
      params,
    });
  }

  /**
   * Assign a target to a learning path
   */
  async assignTargetToPath(learningPathId: string, targetId: string) {
    return await apiClient.put(
      `/v1/api/learning-path/${learningPathId}/target`,
      { targetId }
    );
  }

  /**
   * Get learning paths by target IDs
   */
  async getByTarget(targetIds: string[]) {
    return await apiClient.post("/v1/api/learning-path/by-target", {
      targetIds,
    });
  }
}

export const learningPathService = new LearningPathService();
