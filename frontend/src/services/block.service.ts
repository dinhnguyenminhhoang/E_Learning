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
  async startBlock(blockId: string, learningPathId?: string, lessonId?: string) {
    const url = `/v1/api/block/${blockId}/start${learningPathId ? `?learningPathId=${learningPathId}&lessonId=${lessonId}` : ""
      }`;
    return await apiClient.post<StartBlockResponse>(url);
  }

  async sendVideoHeartbeat(
    blockId: string,
    maxWatchedTime: number,
    videoDuration: number
  ) {
    return await apiClient.post<VideoHeartbeatResponse>(
      `/v1/api/block/${blockId}/video-heartbeat`,
      {
        maxWatchedTime,
        videoDuration,
      }
    );
  }

  async markVocabularyComplete(blockId: string) {
    return await apiClient.post(
      `/v1/api/block/${blockId}/vocabulary-complete`
    );
  }

  async completeBlock(blockId: string) {
    return await apiClient.post(
      `/v1/api/user-block-progress/blocks/${blockId}/complete`
    );
  }

  async initializeBlockProgress(lessonId: string) {
    return await apiClient.post(
      `/v1/api/user-block-progress/lessons/${lessonId}/blocks/initialize`
    );
  }

  async startQuiz(blockId: string) {
    return await apiClient.post<StartQuizResponse>(
      `/v1/api/blocks/${blockId}/quiz/start`
    );
  }

  async submitQuiz(attemptId: string, lessonId: string, answers: QuizAnswer[]) {
    return await apiClient.post<SubmitQuizResponse>(
      `/v1/api/quiz-attempts/${attemptId}/${lessonId}/submit`,
      { answers }
    );
  }

  // ===== ADMIN METHODS =====

  async getAllBlocks(filters: any = {}) {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.skill) params.append("skill", filters.skill);
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.status) params.append("status", filters.status);
    if (filters.lessonId) params.append("lessonId", filters.lessonId);
    if (filters.search) params.append("search", filters.search);
    if (filters.pageNum) params.append("pageNum", filters.pageNum.toString());
    if (filters.pageSize)
      params.append("pageSize", filters.pageSize.toString());

    return await apiClient.get(
      `/v1/api/lesson/blocks/all?${params.toString()}`
    );
  }

  async getBlockById(id: string) {
    return await apiClient.get(`/v1/api/block/${id}`);
  }

  async createBlock(data: any) {
    return await apiClient.post("/v1/api/lesson/blocks", data);
  }

  async updateBlock(id: string, data: any) {
    return await apiClient.put(`/v1/api/lesson/blocks/${id}`, data);
  }

  async deleteBlock(id: string) {
    return await apiClient.delete(`/v1/api/lesson/blocks/${id}`);
  }

  async aiGenerateBlockContent(params: {
    type: string;
    title: string;
    difficulty?: string;
    skill?: string;
  }) {
    return await apiClient.post("/v1/api/block/ai-generate", params);
  }
}

export const blockService = new BlockService();

export type {
  StartBlockResponse,
  VideoHeartbeatResponse,
  QuizQuestion,
  QuizAttempt,
  StartQuizResponse,
  QuizAnswer,
  SubmitQuizResponse,
};
