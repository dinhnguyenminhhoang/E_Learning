import { apiClient } from "@/config/api.config";
import type {
    StartBlockResponse,
    VideoHeartbeatResponse,
    QuizQuestion,
    QuizAttempt,
    StartQuizResponse,
    QuizAnswer,
    SubmitQuizResponse,
} from "@/types/block.types";

class BlockService {
    async startBlock(blockId: string, learningPathId?: string): Promise<any> {
        const url = `/v1/api/block/${blockId}/start${learningPathId ? `?learningPathId=${learningPathId}` : ""
            }`;
        return await apiClient.post<StartBlockResponse>(url);
    }

    async sendVideoHeartbeat(
        blockId: string,
        maxWatchedTime: number,
        videoDuration: number
    ): Promise<any> {
        return await apiClient.post<VideoHeartbeatResponse>(
            `/v1/api/block/${blockId}/video-heartbeat`,
            {
                maxWatchedTime,
                videoDuration,
            }
        );
    }

    async startQuiz(blockId: string): Promise<any> {
        return await apiClient.get<StartQuizResponse>(
            `/v1/api/blocks/${blockId}/quiz/start`
        );
    }

    async submitQuiz(attemptId: string, answers: QuizAnswer[]): Promise<any> {
        return await apiClient.post<SubmitQuizResponse>(
            `/v1/api/quiz-attempts/${attemptId}/submit`,
            { answers }
        );
    }

    async completeBlock(blockId: string, learningPathId: string): Promise<any> {
        return await apiClient.post(
            `/v1/api/block/${blockId}/complete`,
            { learningPathId }
        );
    }

    // ===== ADMIN METHODS =====

    async getAllBlocks(filters: any = {}): Promise<any> {
        const params = new URLSearchParams();

        if (filters.type) params.append('type', filters.type);
        if (filters.skill) params.append('skill', filters.skill);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.status) params.append('status', filters.status);
        if (filters.lessonId) params.append('lessonId', filters.lessonId);
        if (filters.search) params.append('search', filters.search);
        if (filters.pageNum) params.append('pageNum', filters.pageNum.toString());
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

        return await apiClient.get(`/v1/api/lesson/blocks/all?${params.toString()}`);
    }

    async getBlockById(id: string): Promise<any> {
        return await apiClient.get(`/v1/api/block/${id}`);
    }

    async createBlock(data: any): Promise<any> {
        return await apiClient.post('/v1/api/lesson/blocks', data);
    }

    async updateBlock(id: string, data: any): Promise<any> {
        return await apiClient.put(`/v1/api/lesson/blocks/${id}`, data);
    }

    async deleteBlock(id: string): Promise<any> {
        return await apiClient.delete(`/v1/api/lesson/blocks/${id}`);
    }
}

export const blockService = new BlockService();
