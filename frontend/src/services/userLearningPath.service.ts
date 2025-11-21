import { apiClient } from "@/config/api.config";

export interface UserLearningPath {
    _id: string;
    userId: string;
    learningPathId: string;
    currentLevel: number;
    completedLessons: string[];
    progress: number;
    startedAt: Date;
    lastAccessedAt: Date;
    status: string;
}

class UserLearningPathService {
    async getPathByUser() {
        return await apiClient.get("/v1/api/user-learning-path/");
    }
}

export const userLearningPathService = new UserLearningPathService();
