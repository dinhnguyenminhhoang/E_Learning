import { apiClient } from "@/config/api.config";
import { SpeakingTemplate, SpeakingTemplateStats } from "./speakingTemplate.service";

export interface CreateTemplateData {
    text: string;
    textVi?: string;
    level?: "easy" | "medium" | "hard";
    type?: "word" | "sentence";
    category?: string;
    order?: number;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
    status?: "active" | "deleted";
}

export interface AdminTemplatesResponse {
    data: SpeakingTemplate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class AdminSpeakingTemplateService {
    async getAll(params?: {
        level?: string;
        type?: string;
        category?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<AdminTemplatesResponse> {
        const queryParams = new URLSearchParams();
        if (params?.level) queryParams.append("level", params.level);
        if (params?.type) queryParams.append("type", params.type);
        if (params?.category) queryParams.append("category", params.category);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const response = await apiClient.get<any>(
            `/v1/api/admin/speaking-templates?${queryParams.toString()}`
        );
        return response.metadata;
    }

    async create(data: CreateTemplateData): Promise<SpeakingTemplate> {
        const response = await apiClient.post<any>("/v1/api/admin/speaking-templates", data);
        return response.metadata;
    }

    async update(id: string, data: UpdateTemplateData): Promise<SpeakingTemplate> {
        const response = await apiClient.put<any>(`/v1/api/admin/speaking-templates/${id}`, data);
        return response.metadata;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/v1/api/admin/speaking-templates/${id}`);
    }

    async createMany(templates: CreateTemplateData[]): Promise<{ count: number }> {
        const response = await apiClient.post<any>("/v1/api/admin/speaking-templates/bulk", { templates });
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

    async seedTemplates(): Promise<{ count: number }> {
        const response = await apiClient.post<any>("/v1/api/admin/speaking-templates/seed");
        return response.metadata;
    }

    async aiGenerate(params: {
        count?: number;
        level?: "easy" | "medium" | "hard";
        type?: "word" | "sentence";
    }): Promise<{ count: number; templates: SpeakingTemplate[] }> {
        const response = await apiClient.post<any>("/v1/api/admin/speaking-templates/ai-generate", params);
        return response.metadata;
    }
}

export const adminSpeakingTemplateService = new AdminSpeakingTemplateService();
export default adminSpeakingTemplateService;
