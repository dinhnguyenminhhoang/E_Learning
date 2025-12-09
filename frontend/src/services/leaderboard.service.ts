import { apiClient } from "@/config/api.config";

export interface LeaderboardUser {
    id: string;
    rank: number;
    displayName: string;
    avatarUrl?: string;
    xp: number;
    isCurrentUser?: boolean;
    change?: "up" | "down" | "same";
}

export interface LeaderboardResponse {
    status: string;
    message: string;
    data: {
        leaderboard: LeaderboardUser[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    };
    code: number;
}

export interface UserRankResponse {
    status: string;
    message: string;
    data: {
        currentUser: LeaderboardUser;
        usersAbove: LeaderboardUser[];
        usersBelow: LeaderboardUser[];
    };
    code: number;
}

class LeaderboardService {
    /**
     * Get leaderboard rankings
     * @param period - "weekly", "monthly", or "allTime"
     * @param limit - Number of users to fetch (default: 100)
     * @param offset - Offset for pagination (default: 0)
     */
    async getLeaderboard(
        period: "weekly" | "monthly" | "allTime" = "allTime",
        limit: number = 100,
        offset: number = 0
    ): Promise<LeaderboardUser[]> {
        try {
            const response: LeaderboardResponse = await apiClient.get(
                "/v1/api/leaderboard",
                {
                    params: { period, limit, offset },
                }
            );

            if (response.code === 200 && response.data?.leaderboard) {
                return response.data.leaderboard;
            }

            return [];
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            throw error;
        }
    }

    /**
     * Get current user's rank and nearby users
     * @param period - "weekly", "monthly", or "allTime"
     */
    async getMyRank(
        period: "weekly" | "monthly" | "allTime" = "allTime"
    ): Promise<{
        currentUser: LeaderboardUser;
        usersAbove: LeaderboardUser[];
        usersBelow: LeaderboardUser[];
    }> {
        try {
            const response: UserRankResponse = await apiClient.get(
                "/v1/api/leaderboard/me",
                {
                    params: { period },
                }
            );

            if (response.code === 200 && response.data) {
                return response.data;
            }

            throw new Error("Failed to fetch user rank");
        } catch (error) {
            console.error("Error fetching user rank:", error);
            throw error;
        }
    }
}

export const leaderboardService = new LeaderboardService();
