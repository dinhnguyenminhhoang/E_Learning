import { apiClient } from "@/config/api.config";
import { UserLearningPath, UserOverview } from "@/types/learning";

class UserLearningPathService {
  async getPathByUser() {
    return await apiClient.get("/v1/api/user-learning-path/");
  }

  async getUserOverview(): Promise<any> {
    return await apiClient.get("/v1/api/user-learning-path/overview");
  }

  async getAllUserPaths(): Promise<any> {
    return await apiClient.get("/v1/api/user-learning-path/all");
  }

  async addLearningPath(
    learningPathId: string,
    targetId?: string
  ): Promise<any> {
    return await apiClient.post("/v1/api/user-learning-path/add", {
      learningPathId,
      targetId,
    });
  }

  async switchActivePath(learningPathId: string): Promise<any> {
    return await apiClient.patch(
      `/v1/api/user-learning-path/switch/${learningPathId}`
    );
  }
}

export const userLearningPathService = new UserLearningPathService();
