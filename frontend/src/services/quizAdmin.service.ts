import { apiClient } from "@/config/api.config";
import { Quiz, CreateQuizInput } from "@/types/admin";

class QuizService {
    async getAll(params?: {
        search?: string;
        status?: string;
        skill?: string;
        difficulty?: string;
        pageNum?: number;
        pageSize?: number;
    }): Promise<{
        code: number;
        data: Quiz[];
        pagination?: {
            total: number;
            pageNum: number;
            pageSize: number;
            totalPages: number;
        };
    }> {
        try {
            const response = await apiClient.get<any>("/v1/api/quiz/getAll", { params });
            return {
                code: 200,
                data: response.data || [],
                pagination: response.pagination,
            };
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            return { code: 500, data: [] };
        }
    }

    async getById(id: string): Promise<{ code: number; data: Quiz | null }> {
        try {
            const response = await apiClient.get<{ data: Quiz }>(`/v1/api/quiz/getById/${id}`);
            return { code: 200, data: response.data };
        } catch (error) {
            console.error("Error fetching quiz:", error);
            return { code: 404, data: null };
        }
    }

    async create(input: CreateQuizInput): Promise<{ code: number; data: Quiz | null }> {
        try {
            const response = await apiClient.post<{ data: Quiz }>("/v1/api/quiz/create", input);
            return { code: 201, data: response.data };
        } catch (error) {
            console.error("Error creating quiz:", error);
            return { code: 500, data: null };
        }
    }

    async update(id: string, input: Partial<CreateQuizInput>): Promise<{ code: number; data: Quiz | null }> {
        try {
            const response = await apiClient.put<{ data: Quiz }>(`/v1/api/quiz/update/${id}`, input);
            return { code: 200, data: response.data };
        } catch (error) {
            console.error("Error updating quiz:", error);
            return { code: 500, data: null };
        }
    }

    async delete(id: string): Promise<{ code: number; message: string }> {
        try {
            await apiClient.delete(`/v1/api/quiz/delete/${id}`);
            return { code: 200, message: "Quiz deleted successfully" };
        } catch (error) {
            console.error("Error deleting quiz:", error);
            return { code: 500, message: "Failed to delete quiz" };
        }
    }

    async addQuestions(id: string, questions: any[]): Promise<{ code: number; message: string }> {
        try {
            await apiClient.post(`/v1/api/quiz/${id}/questions`, { questions });
            return { code: 200, message: "Questions added successfully" };
        } catch (error) {
            console.error("Error adding questions:", error);
            return { code: 500, message: "Failed to add questions" };
        }
    }

    async updateQuestion(quizId: string, questionId: string, questionData: any): Promise<{ code: number; message: string }> {
        try {
            await apiClient.put(`/v1/api/quiz/${quizId}/questions/${questionId}`, questionData);
            return { code: 200, message: "Question updated successfully" };
        } catch (error) {
            console.error("Error updating question:", error);
            return { code: 500, message: "Failed to update question" };
        }
    }

    async deleteQuestion(quizId: string, questionId: string): Promise<{ code: number; message: string }> {
        try {
            await apiClient.delete(`/v1/api/quiz/${quizId}/questions/${questionId}`);
            return { code: 200, message: "Question deleted successfully" };
        } catch (error) {
            console.error("Error deleting question:", error);
            return { code: 500, message: "Failed to delete question" };
        }
    }
}

export const quizAdminService = new QuizService();
