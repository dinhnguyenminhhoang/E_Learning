export interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    birthday: string;
    avatarUrl?: string;
    bio?: string;
    joinDate: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    totalWordsLearned: number;
    totalTimeSpent: number; // minutes
    rank: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress: number;
    total: number;
    isUnlocked: boolean;
}

export interface LearningStat {
    date: string;
    words: number;
    time: number; // minutes
}
