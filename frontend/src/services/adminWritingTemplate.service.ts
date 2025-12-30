import { apiClient } from "@/config/api.config";
import { WritingTemplate, WritingTemplateStats } from "./writingTemplate.service";

export interface CreateTemplateData {
    title: string;
    titleVi?: string;
    prompt: string;
    promptVi?: string;
    level?: "easy" | "medium" | "hard";
    type?: "essay" | "email" | "story" | "description" | "opinion";
    category?: string;
    minWords?: number;
    maxWords?: number;
    sampleAnswer?: string;
    hints?: string[];
    order?: number;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
    status?: "active" | "deleted";
}

export interface AdminTemplatesResponse {
    data: WritingTemplate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class AdminWritingTemplateService {
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
            `/v1/api/admin/writing-templates?${queryParams.toString()}`
        );
        return response.metadata;
    }

    async create(data: CreateTemplateData): Promise<WritingTemplate> {
        const response = await apiClient.post<any>("/v1/api/admin/writing-templates", data);
        return response.metadata;
    }

    async update(id: string, data: UpdateTemplateData): Promise<WritingTemplate> {
        const response = await apiClient.put<any>(`/v1/api/admin/writing-templates/${id}`, data);
        return response.metadata;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/v1/api/admin/writing-templates/${id}`);
    }

    async createMany(templates: CreateTemplateData[]): Promise<{ count: number }> {
        const response = await apiClient.post<any>("/v1/api/admin/writing-templates/bulk", { templates });
        return response.metadata;
    }

    async getStats(): Promise<WritingTemplateStats> {
        const response = await apiClient.get<any>("/v1/api/writing-templates/stats");
        return response.metadata;
    }

    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<any>("/v1/api/writing-templates/categories");
        return response.metadata;
    }

    async aiGenerate(params: {
        count?: number;
        level?: "easy" | "medium" | "hard";
        type?: "essay" | "email" | "story" | "description" | "opinion";
    }): Promise<{ count: number; templates: WritingTemplate[] }> {
        const response = await apiClient.post<any>("/v1/api/admin/writing-templates/ai-generate", params);
        return response.metadata;
    }
}

export const adminWritingTemplateService = new AdminWritingTemplateService();
export default adminWritingTemplateService;
