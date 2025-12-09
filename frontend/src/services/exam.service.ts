import { apiClient } from "@/config/api.config";
import type {
    Exam,
    CreateExamRequest,
    UpdateExamRequest,
    ExamResponse,
    ExamListResponse,
    DeleteExamResponse,
} from "@/types/exam.types";

class ExamService {
    async createExam(data: CreateExamRequest) {
        return await apiClient.post<ExamResponse>("/v1/api/exam", data);
    }

    async getExams(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }) {
        return await apiClient.get<ExamListResponse>("/v1/api/exam", { params });
    }

    async getExamById(examId: string) {
        return await apiClient.get<ExamResponse>(`/v1/api/exam/${examId}`);
    }

    async updateExam(examId: string, data: UpdateExamRequest) {
        return await apiClient.put<ExamResponse>(`/v1/api/exam/${examId}`, data);
    }

    async deleteExam(examId: string) {
        return await apiClient.delete<DeleteExamResponse>(`/v1/api/exam/${examId}`);
    }
}

export const examService = new ExamService();
