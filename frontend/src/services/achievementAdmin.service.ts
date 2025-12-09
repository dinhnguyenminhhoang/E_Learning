import { apiClient } from "@/config/api.config";

class AchievementAdminService {
    async getAllAchievements(params?: {
        page?: number;
        limit?: number;
        type?: string;
        rarity?: string;
        status?: string;
    }): Promise<any> {
        return await apiClient.get("/v1/api/achievements/admin/list", { params });
    }
    async createAchievement(data: any): Promise<any> {
        return await apiClient.post("/v1/api/achievements/admin", data);
    }
    async updateAchievement(id: string, data: any): Promise<any> {
        return await apiClient.put(`/v1/api/achievements/admin/${id}`, data);
    }

    async deleteAchievement(id: string): Promise<any> {
        return await apiClient.delete(`/v1/api/achievements/admin/${id}`);
    }
}

export const achievementAdminService = new AchievementAdminService();
