import { apiClient } from "@/config/api.config";
import { UserLearningPath, UserOverview } from "@/types/learning";

class UserLearningPathService {
    async getPathByUser() {
        return await apiClient.get("/v1/api/user-learning-path/");
    }

    async getUserOverview(): Promise<any> {
        return await apiClient.get("/v1/api/user-learning-path/overview");
    }
}

export const userLearningPathService = new UserLearningPathService();
