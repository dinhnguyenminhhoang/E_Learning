// Achievement Types

export interface Achievement {
    _id: string;
    name: string;
    nameVi?: string;
    description: string;
    icon: string;
    type: "streak" | "words_learned" | "quiz_score" | "sessions" | "custom";
    criteria: {
        target: number;
        unit: string;
    };
    rarity: "common" | "rare" | "epic" | "legendary";
    status: string;
    points: number;
    createdAt: string;
    updatedAt?: string;
}

export interface UserAchievement {
    _id: string;
    user: string;
    achievement: Achievement;
    unlockedAt?: string;
    progress: number; // 0-100
    isCompleted: boolean;
    createdAt: string;
}

export interface AchievementStats {
    total: number;
    completed: number;
    inProgress: number;
    locked: number;
}

export interface AchievementsByRarity {
    common: UserAchievement[];
    rare: UserAchievement[];
    epic: UserAchievement[];
    legendary: UserAchievement[];
}

export interface MyAchievementsResponse {
    code: number;
    message: string;
    data: {
        achievements: UserAchievement[];
        stats: AchievementStats;
        byRarity: AchievementsByRarity;
    };
}

export interface AchievementDetailsResponse {
    code: number;
    message: string;
    data: UserAchievement;
}
