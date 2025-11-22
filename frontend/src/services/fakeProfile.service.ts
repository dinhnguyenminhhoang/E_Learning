

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

// Mock Data
const MOCK_PROFILE: UserProfile = {
    id: "user_123",
    displayName: "Hoang Dinh",
    email: "dinhnguyenminhhoang28@gmail.com",
    phoneNumber: "0987654321",
    birthday: "1999-10-28",
    bio: "Passionate English learner. Aiming for IELTS 8.0!",
    joinDate: "2025-01-15",
    level: 5,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 12,
    totalWordsLearned: 450,
    totalTimeSpent: 1280,
    rank: "Gold Learner",
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
    {
        id: "ach_1",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        unlockedAt: "2025-01-16",
        progress: 1,
        total: 1,
        isUnlocked: true,
    },
    {
        id: "ach_2",
        title: "Word Master",
        description: "Learn 500 words",
        icon: "📚",
        progress: 450,
        total: 500,
        isUnlocked: false,
    },
    {
        id: "ach_3",
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon: "🔥",
        unlockedAt: "2025-01-22",
        progress: 7,
        total: 7,
        isUnlocked: true,
    },
    {
        id: "ach_4",
        title: "Early Bird",
        description: "Complete a lesson before 8 AM",
        icon: "🌅",
        progress: 0,
        total: 1,
        isUnlocked: false,
    },
    {
        id: "ach_5",
        title: "Speed Racer",
        description: "Complete a quiz in under 1 minute",
        icon: "⚡",
        unlockedAt: "2025-02-10",
        progress: 1,
        total: 1,
        isUnlocked: true,
    },
];

const MOCK_STATS: LearningStat[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
        date: date.toISOString().split("T")[0],
        words: Math.floor(Math.random() * 20) + 5,
        time: Math.floor(Math.random() * 45) + 15,
    };
});

export const fakeProfileService = {
    getProfile: async (): Promise<UserProfile> => {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
        return { ...MOCK_PROFILE };
    },

    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        Object.assign(MOCK_PROFILE, data);
        return { ...MOCK_PROFILE };
    },

    getAchievements: async (): Promise<Achievement[]> => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return [...MOCK_ACHIEVEMENTS];
    },

    getStats: async (): Promise<LearningStat[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [...MOCK_STATS];
    },
};
