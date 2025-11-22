import { apiClient } from "@/config/api.config";
import { UserLearningPath } from "@/types/learning";

class UserLearningPathService {
    async getPathByUser() {
        return await apiClient.get("/v1/api/user-learning-path/");
    }
}

export const userLearningPathService = new UserLearningPathService();
