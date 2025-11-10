import { apiClient } from "@/config/api.config";

export interface Category {
  _id: string;
  name: string;
  nameVi: string;
  slug: string;
  description?: string;
  status: string;
}

class CategoryService {
  async createCategory(data: Partial<Category>) {
    return await apiClient.post("/v1/api/category/create", data);
  }

  async listCategories(query?: any) {
    return await apiClient.get("/v1/api/category/", { params: query });
  }

  async getCategoryById(id: string) {
    return await apiClient.get(`/v1/api/category/getById/${id}`);
  }

  async updateCategory(id: string, data: Partial<Category>) {
    return await apiClient.put(`/v1/api/category/${id}`, data);
  }

  async deleteCategory(id: string) {
    return await apiClient.delete(`/v1/api/category/delete/${id}`);
  }
}

export const categoryService = new CategoryService();
