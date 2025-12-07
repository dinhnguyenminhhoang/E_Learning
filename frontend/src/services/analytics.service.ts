import { apiClient } from "@/config/api.config";

export interface OverviewStats {
    overview: {
        totalUsers: number;
        activeUsers: number;
        totalWords: number;
        totalCategories: number;
        totalCardDecks: number;
        totalLearningPaths: number;
        totalLessons: number;
        totalQuizzes: number;
        totalExams: number;
    };
    changes: {
        usersChange: number;
        wordsChange: number;
        lessonsChange: number;
    };
}

export interface TrendData {
    date: string;
    count: number;
    label: string;
}

export interface ContentDistribution {
    wordsByLevel: { name: string; value: number }[];
    wordsByCategory: { name: string; value: number }[];
    lessonsByStatus: { name: string; value: number }[];
}

export interface RecentActivity {
    recentWords: any[];
    recentUsers: any[];
    recentLessons: any[];
}

class AnalyticsService {
    async getOverviewStats(): Promise<{ code: number; data: OverviewStats }> {
        return await apiClient.get("/v1/api/analytics/overview");
    }

    async getUserTrend(period: number = 7): Promise<{ code: number; data: { trend: TrendData[]; period: number } }> {
        return await apiClient.get("/v1/api/analytics/users/trend", { params: { period } });
    }

    async getContentDistribution(): Promise<{ code: number; data: ContentDistribution }> {
        return await apiClient.get("/v1/api/analytics/content/distribution");
    }

    async getRecentActivity(limit: number = 10): Promise<{ code: number; data: RecentActivity }> {
        return await apiClient.get("/v1/api/analytics/activity/recent", { params: { limit } });
    }

    async getAssessmentStats(): Promise<{ code: number; data: any }> {
        return await apiClient.get("/v1/api/analytics/assessments");
    }

    async getLearningPathStats(): Promise<{ code: number; data: any }> {
        return await apiClient.get("/v1/api/analytics/learning-paths");
    }
}

export const analyticsService = new AnalyticsService();
