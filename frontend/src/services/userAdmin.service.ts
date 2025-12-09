import { AdminUser, CreateUserInput } from "@/types/admin";
import { apiClient } from "@/config/api.config";

class UserAdminService {
    async getAll(params?: {
        pageNum?: number;
        pageSize?: number;
        search?: string;
        role?: string;
        status?: string;
    }): Promise<any> {
        const response = await apiClient.get("/v1/api/admin/users", { params });
        return response;
    }

    async getById(id: string): Promise<any> {
        return await apiClient.get(`/v1/api/admin/users/${id}`);
    }

    async create(input: CreateUserInput): Promise<any> {
        // Note: User creation typically goes through signup
        return await apiClient.post("/v1/api/admin/users", input);
    }

    async update(
        id: string,
        input: Partial<CreateUserInput>
    ): Promise<any> {
        return await apiClient.put(`/v1/api/admin/users/${id}`, input);
    }

    async delete(id: string): Promise<any> {
        return await apiClient.post(`/v1/api/admin/users/${id}/deactivate`);
    }

    async activate(id: string): Promise<any> {
        return await apiClient.post(`/v1/api/admin/users/${id}/activate`);
    }
}

export const userAdminService = new UserAdminService();
