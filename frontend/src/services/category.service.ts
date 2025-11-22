import { Category, CreateCategoryInput } from "@/types/admin";
import { apiClient } from "@/config/api.config";

class CategoryService {
  async getAll(): Promise<{ code: number; data: Category[] }> {
    return await apiClient.get("/v1/api/category/");
  }

  async getById(id: string): Promise<{ code: number; data: Category | null }> {
    return await apiClient.get(`/v1/api/category/getById/${id}`);
  }

  async create(
    input: CreateCategoryInput
  ): Promise<{ code: number; data: Category }> {
    return await apiClient.post("/v1/api/category/create", input);
  }

  async update(
    id: string,
    input: Partial<CreateCategoryInput>
  ): Promise<{ code: number; data: Category | null }> {
    return await apiClient.put(`/v1/api/category/${id}`, input);
  }

  async delete(id: string): Promise<{ code: number; message: string }> {
    return await apiClient.delete(`/v1/api/category/delete/${id}`);
  }
}

export const categoryService = new CategoryService();
