import { apiClient } from "@/config/api.config";
import type {
    Target,
    CreateTargetInput,
    UpdateTargetInput,
    TargetOption,
    TargetListResponse,
} from "@/types/target";

class TargetService {
    /**
     * Get all targets with pagination and search
     */
    async getAllTargets(params?: {
        pageNum?: number;
        pageSize?: number;
        search?: string;
    }): Promise<TargetListResponse> {
        return await apiClient.get("/v1/api/target/get-all-targets", { params });
    }

    /**
     * Get targets that are not assigned to any learning path
     * Used for dropdown selection when assigning targets
     */
    async getUnassignedTargets(): Promise<{
        code: number;
        message: string;
        data: TargetOption[];
    }> {
        return await apiClient.get("/v1/api/target/unassigned");
    }

    /**
     * Create a new target
     */
    async createTarget(data: CreateTargetInput): Promise<{
        code: number;
        message: string;
        data: Target;
    }> {
        // Ensure key is uppercase
        const payload = {
            ...data,
            key: data.key.toUpperCase(),
        };
        return await apiClient.post("/v1/api/target", payload);
    }

    /**
     * Update an existing target
     */
    async updateTarget(
        targetId: string,
        data: UpdateTargetInput
    ): Promise<{
        code: number;
        message: string;
        data: Target;
    }> {
        // Ensure key is uppercase if provided
        const payload = {
            ...data,
            ...(data.key && { key: data.key.toUpperCase() }),
        };
        return await apiClient.put(`/v1/api/target/${targetId}`, payload);
    }

    /**
     * Soft delete a target
     */
    async deleteTarget(targetId: string): Promise<{
        code: number;
        message: string;
        data: { id: string };
    }> {
        return await apiClient.delete(`/v1/api/target/${targetId}`);
    }
}

export const targetService = new TargetService();
