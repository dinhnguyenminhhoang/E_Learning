export interface LeaderboardUser {
    id: string;
    rank: number;
    displayName: string;
    avatarUrl?: string;
    xp: number;
    isCurrentUser?: boolean;
    change?: "up" | "down" | "same";
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
    { id: "u1", rank: 1, displayName: "Sarah Connor", xp: 5200, change: "same" },
    { id: "u2", rank: 2, displayName: "John Wick", xp: 4950, change: "up" },
    { id: "u3", rank: 3, displayName: "Tony Stark", xp: 4800, change: "down" },
    { id: "u4", rank: 4, displayName: "Steve Rogers", xp: 4500, change: "same" },
    { id: "u5", rank: 5, displayName: "Natasha Romanoff", xp: 4300, change: "up" },
    { id: "u6", rank: 6, displayName: "Bruce Banner", xp: 4100, change: "down" },
    { id: "u7", rank: 7, displayName: "Thor Odinson", xp: 3900, change: "same" },
    { id: "u8", rank: 8, displayName: "Clint Barton", xp: 3700, change: "same" },
    { id: "u9", rank: 9, displayName: "Wanda Maximoff", xp: 3500, change: "up" },
    { id: "u10", rank: 10, displayName: "Peter Parker", xp: 3300, change: "up" },
    { id: "user_123", rank: 15, displayName: "Hoang Dinh", xp: 2450, isCurrentUser: true, change: "up" },
];

export const fakeLeaderboardService = {
    getLeaderboard: async (period: "weekly" | "monthly" | "allTime" = "weekly"): Promise<LeaderboardUser[]> => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        // Simulate different data for periods
        if (period === "monthly") {
            return MOCK_LEADERBOARD.map(u => ({ ...u, xp: u.xp * 4 }));
        }
        return [...MOCK_LEADERBOARD];
    }
};
