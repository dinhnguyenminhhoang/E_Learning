import { apiClient } from "@/config/api.config";

export interface WritingTemplate {
    _id: string;
    title: string;
    titleVi?: string;
    prompt: string;
    promptVi?: string;
    level: "easy" | "medium" | "hard";
    type: "essay" | "email" | "story" | "description" | "opinion";
    category?: string;
    minWords: number;
    maxWords: number;
    sampleAnswer?: string;
    hints?: string[];
    order: number;
}

export interface WritingTemplateStats {
    total: number;
    byLevel: {
        easy: number;
        medium: number;
        hard: number;
    };
    byType: {
        essay: number;
        email: number;
        story: number;
        description: number;
        opinion: number;
    };
}

export interface TemplatesResponse {
    data: WritingTemplate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class WritingTemplateService {
    async getTemplates(params?: {
        level?: string;
        type?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<TemplatesResponse> {
        const queryParams = new URLSearchParams();
        if (params?.level) queryParams.append("level", params.level);
        if (params?.type) queryParams.append("type", params.type);
        if (params?.category) queryParams.append("category", params.category);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const response = await apiClient.get<any>(
            `/v1/api/writing-templates/templates?${queryParams.toString()}`
        );
        return response.metadata;
    }

    async getRandomTemplates(params?: {
        level?: string;
        type?: string;
        count?: number;
    }): Promise<{ data: WritingTemplate[]; total: number }> {
        const queryParams = new URLSearchParams();
        if (params?.level) queryParams.append("level", params.level);
        if (params?.type) queryParams.append("type", params.type);
        if (params?.count) queryParams.append("count", params.count.toString());

        const response = await apiClient.get<any>(
            `/v1/api/writing-templates/templates/random?${queryParams.toString()}`
        );

        if (!response || !response.metadata) {
            return { data: [], total: 0 };
        }

        return response.metadata;
    }

    async getTemplateById(id: string): Promise<WritingTemplate> {
        const response = await apiClient.get<any>(`/v1/api/writing-templates/templates/${id}`);
        return response.metadata;
    }

    async getStats(): Promise<WritingTemplateStats> {
        try {
            const response = await apiClient.get<any>("/v1/api/writing-templates/stats");

            if (!response || !response.metadata) {
                return {
                    total: 0,
                    byLevel: { easy: 0, medium: 0, hard: 0 },
                    byType: { essay: 0, email: 0, story: 0, description: 0, opinion: 0 }
                };
            }

            return response.metadata;
        } catch (error) {
            console.error("Error fetching writing template stats:", error);
            return {
                total: 0,
                byLevel: { easy: 0, medium: 0, hard: 0 },
                byType: { essay: 0, email: 0, story: 0, description: 0, opinion: 0 }
            };
        }
    }

    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<any>("/v1/api/writing-templates/categories");
        return response.metadata;
    }
}

export const writingTemplateService = new WritingTemplateService();
export default writingTemplateService;
