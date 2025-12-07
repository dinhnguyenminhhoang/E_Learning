import { AdminUser, CreateUserInput } from "@/types/admin";
import { apiClient } from "@/config/api.config";

class UserAdminService {
    async getAll(params?: {
        pageNum?: number;
        pageSize?: number;
        search?: string;
        role?: string;
        status?: string;
    }): Promise<{ code: number; data: AdminUser[]; pagination?: any }> {
        const response = await apiClient.get("/v1/api/admin/users", { params });
        return response;
    }

    async getById(id: string): Promise<{ code: number; data: AdminUser | null }> {
        return await apiClient.get(`/v1/api/admin/users/${id}`);
    }

    async create(input: CreateUserInput): Promise<{ code: number; data: AdminUser }> {
        // Note: User creation typically goes through signup
        return await apiClient.post("/v1/api/admin/users", input);
    }

    async update(
        id: string,
        input: Partial<CreateUserInput>
    ): Promise<{ code: number; data: AdminUser | null }> {
        return await apiClient.put(`/v1/api/admin/users/${id}`, input);
    }

    async delete(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.post(`/v1/api/admin/users/${id}/deactivate`);
    }

    async activate(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.post(`/v1/api/admin/users/${id}/activate`);
    }
}

export const userAdminService = new UserAdminService();
