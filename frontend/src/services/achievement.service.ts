import { apiClient } from "@/config/api.config";
import type {
    MyAchievementsResponse,
    AchievementDetailsResponse,
} from "@/Types/achievement.types";

class AchievementService {
    /**
     * Get all achievements for current user with progress
     */
    async getMyAchievements(): Promise<MyAchievementsResponse> {
        return await apiClient.get<MyAchievementsResponse>("/v1/api/achievements/my");
    }

    /**
     * Get specific achievement details
     */
    async getAchievementById(achievementId: string): Promise<AchievementDetailsResponse> {
        return await apiClient.get<AchievementDetailsResponse>(
            `/v1/api/achievements/${achievementId}`
        );
    }
}

export const achievementService = new AchievementService();

export type {
    Achievement,
    UserAchievement,
    AchievementStats,
    MyAchievementsResponse,
    AchievementDetailsResponse,
} from "@/Types/achievement.types";
