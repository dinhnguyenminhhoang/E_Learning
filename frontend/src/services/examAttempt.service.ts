import { apiClient } from "@/config/api.config";
import type {
    StartExamResponse,
    SectionQuestionsResponse,
    SubmitSectionRequest,
    SubmitSectionResponse,
    CompleteExamResponse,
    ExamResultResponse,
} from "@/types/examAttempt.types";

class ExamAttemptService {
    async startExam(examId: string) {
        return await apiClient.post<StartExamResponse>(
            `/v1/api/exam/${examId}/start`
        );
    }

    async getSectionQuestions(attemptId: string, sectionId: string) {
        return await apiClient.get<SectionQuestionsResponse>(
            `/v1/api/exam/exam-attempts/${attemptId}/section/${sectionId}`
        );
    }

    async submitSection(
        attemptId: string,
        sectionId: string,
        data: SubmitSectionRequest
    ) {
        return await apiClient.post<SubmitSectionResponse>(
            `/v1/api/exam/exam-attempts/${attemptId}/section/${sectionId}/submit`,
            data
        );
    }

    async completeExam(attemptId: string) {
        return await apiClient.post<CompleteExamResponse>(
            `/v1/api/exam/exam-attempts/${attemptId}/submit`
        );
    }

    async getExamResult(attemptId: string) {
        return await apiClient.get<ExamResultResponse>(
            `/v1/api/exam/exam-attempts/${attemptId}`
        );
    }
}

export const examAttemptService = new ExamAttemptService();
