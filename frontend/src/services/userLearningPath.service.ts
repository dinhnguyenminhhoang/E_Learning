import { apiClient } from "@/config/api.config";
import { Paths, UserLearningPath, UserOverview } from "@/types/learning";
import { UserLearningPathResponse } from "@/types/userPath";

class UserLearningPathService {
  async getPathByUser() {
    return await apiClient.get("/v1/api/user-learning-path/");
  }

  async getUserOverview(): Promise<any> {
    return await apiClient.get("/v1/api/user-learning-path/overview");
  }

  async getPathsByUser(): Promise<UserLearningPathResponse> {
    return await apiClient.get("/v1/api/user-learning-path/paths-by-user");
  }
}

export const userLearningPathService = new UserLearningPathService();
