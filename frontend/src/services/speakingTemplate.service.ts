import { apiClient } from "@/config/api.config";

export interface SpeakingTemplate {
    _id: string;
    text: string;
    textVi?: string;
    level: "easy" | "medium" | "hard";
    type: "word" | "sentence";
    category?: string;
    order: number;
}

export interface SpeakingTemplateStats {
    total: number;
    byLevel: {
        easy: number;
        medium: number;
        hard: number;
    };
    byType: {
        word: number;
        sentence: number;
    };
}

export interface TemplatesResponse {
    data: SpeakingTemplate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class SpeakingTemplateService {
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
            `/v1/api/speaking-templates/templates?${queryParams.toString()}`
        );
        return response.metadata;
    }

    async getRandomTemplates(params?: {
        level?: string;
        type?: string;
        count?: number;
    }): Promise<{ data: SpeakingTemplate[]; total: number }> {
        const queryParams = new URLSearchParams();
        if (params?.level) queryParams.append("level", params.level);
        if (params?.type) queryParams.append("type", params.type);
        if (params?.count) queryParams.append("count", params.count.toString());

        const response = await apiClient.get<any>(
            `/v1/api/speaking-templates/templates/random?${queryParams.toString()}`
        );
        return response.metadata;
    }

    async getStats(): Promise<SpeakingTemplateStats> {
        const response = await apiClient.get<any>("/v1/api/speaking-templates/stats");
        return response.metadata;
    }

    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<any>("/v1/api/speaking-templates/categories");
        return response.metadata;
    }
}

export const speakingTemplateService = new SpeakingTemplateService();
export default speakingTemplateService;
