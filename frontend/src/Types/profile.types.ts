export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    avatar: string;
    bio: string;
    joinDate: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    progressInLevel: number;
    xpNeededForNext: number;
    rank: string;
    statistics: UserStatistics;
    learningPreferences: LearningPreferences;
}

export interface UserStatistics {
    totalWordsLearned: number;
    currentStreak: number;
    longestStreak: number;
    currentLoginStreak: number;
    longestLoginStreak: number;
    totalStudyTime: number;
    averageAccuracy: number;
    totalXP: number;
    weeklyXP: number;
    monthlyXP: number;
    completedAchievements: number;
}

export interface LearningPreferences {
    dailyGoal: number;
    studyReminder: boolean;
    preferredStudyTime?: string;
    difficultyLevel: string;
}

export interface DailyStat {
    date: string;
    wordsLearned: number;
    studyTime: number;
    quizzesTaken: number;
    xpEarned: number;
}

export interface UpdateProfileData {
    name?: string;
    phoneNumber?: string;
    bio?: string;
    avatar?: string;
    learningPreferences?: Partial<LearningPreferences>;
}
