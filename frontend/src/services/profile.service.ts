import { apiClient } from "@/config/api.config";
import type {
    UserProfile,
    DailyStat,
    UpdateProfileData,
} from "@/Types/profile.types";

class ProfileService {
    private basePath = "/v1/api/profile";

    async getMyProfile(): Promise<{ code: number; data: UserProfile }> {
        const response = await apiClient.get(`${this.basePath}/me`);
        return response;
    }

    async updateProfile(data: UpdateProfileData): Promise<{ code: number; data: Partial<UserProfile> }> {
        const response = await apiClient.put(`${this.basePath}/me`, data);
        return response;
    }

    async getWeeklyStats(): Promise<{ code: number; data: DailyStat[] }> {
        const response = await apiClient.get(`${this.basePath}/stats`);
        return response;
    }

    async updateAvatar(avatarUrl: string): Promise<{ code: number; data: { avatar: string } }> {
        const response = await apiClient.put(`${this.basePath}/avatar`, { avatarUrl });
        return response;
    }
}

export const profileService = new ProfileService();
