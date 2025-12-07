import { apiClient } from "@/config/api.config";
import { Lesson, CreateLessonInput } from "@/types/admin";

class LessonService {
  async getAll(params?: {
    pageNum?: number;
    pageSize?: number;
    search?: string;
    skill?: string;
    status?: string;
  }): Promise<{
    code: number;
    data: Lesson[];
    pagination?: {
      total: number;
      pageNum: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.pageNum) queryParams.append("pageNum", params.pageNum.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.skill && params.skill !== "all") queryParams.append("skill", params.skill);
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);

    const url = `/v1/api/lesson${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response: any = await apiClient.get(url);

    return {
      code: response?.code || 200,
      data: response?.data?.lessons || [],
      pagination: response?.pagination,
    };
  }

  async getById(id: string): Promise<{ code: number; data: Lesson | null }> {
    try {
      const response = await this.getAll();
      if (response.code === 200) {
        const lesson = response.data.find((l: Lesson) => l._id === id);
        return { code: lesson ? 200 : 404, data: lesson || null };
      }
      return { code: response.code, data: null };
    } catch (error) {
      return { code: 500, data: null };
    }
  }

  async getDetailForEdit(id: string): Promise<{ code: number; data: any }> {
    return await apiClient.get(`/v1/api/lesson/${id}/edit`);
  }

  async create(input: CreateLessonInput): Promise<{ code: number; data: Lesson }> {
    return await apiClient.post("/v1/api/lesson", input);
  }

  async update(
    id: string,
    input: Partial<CreateLessonInput>
  ): Promise<{ code: number; data: Lesson | null }> {
    try {
      const response = await apiClient.put<{ data: Lesson }>(
        `/v1/api/lesson/${id}`,
        input
      );
      return { code: 200, data: response.data };
    } catch (error) {
      return { code: 500, data: null };
    }
  }

  async delete(id: string): Promise<{ code: number; message: string }> {
    try {
      await apiClient.delete(`/v1/api/lesson/${id}`);
      return { code: 200, message: "Lesson deleted successfully" };
    } catch (error) {
      return { code: 500, message: "Failed to delete lesson" };
    }
  }

  async assignBlockToLesson(data: {
    lessonId: string;
    blockId: string;
    order: number;
  }): Promise<{ code: number; message: string; data?: any }> {
    return await apiClient.post(`/v1/api/lesson/${data.lessonId}/blocks`, {
      blockId: data.blockId,
      order: data.order,
    });
  }

  async attachQuiz(data: {
    lessonId: string;
    quizId: string;
    blockId?: string;
  }): Promise<{ code: number; message: string; data?: any }> {
    try {
      const response = await apiClient.post("/v1/api/lesson/attach-quiz", data);
      return { code: 200, message: "Quiz attached successfully", data: response };
    } catch (error) {
      console.error("Error attaching quiz:", error);
      return { code: 500, message: "Failed to attach quiz" };
    }
  }

  async detachQuiz(data: {
    lessonId: string;
    quizId: string;
  }): Promise<{ code: number; message: string }> {
    try {
      await apiClient.post("/v1/api/lesson/detach-quiz", data);
      return { code: 200, message: "Quiz detached successfully" };
    } catch (error) {
      console.error("Error detaching quiz:", error);
      return { code: 500, message: "Failed to detach quiz" };
    }
  }

  async removeBlockFromLesson(blockId: string): Promise<{ code: number; message: string }> {
    try {
      await apiClient.delete(`/v1/api/lesson/blocks/${blockId}`);
      return { code: 200, message: "Block removed successfully" };
    } catch (error) {
      console.error("Error removing block:", error);
      return { code: 500, message: "Failed to remove block" };
    }
  }
}

export const lessonService = new LessonService();
