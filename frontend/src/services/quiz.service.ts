import { apiClient } from "@/config/api.config";

export interface Quiz {
  _id: string;
  title: string;
  attachedTo: {
    kind: string;
    item: string;
  };
  questions: Array<{
    sourceType: string;
    sourceId: string;
    type: string;
    questionText: string;
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer?: string;
    explanation?: string;
    points?: number;
  }>;
  xpReward?: number;
  difficulty?: string;
  status: string;
}

class QuizService {
  async createQuiz(data: Partial<Quiz>) {
    return await apiClient.post("/v1/api/quiz/create", data);
  }

  async getAllQuizzes(query?: any) {
    return await apiClient.get("/v1/api/quiz/getAll", { params: query });
  }

  async getQuizById(id: string) {
    return await apiClient.get(`/v1/api/quiz/getById/${id}`);
  }

  async updateQuiz(id: string, data: Partial<Quiz>) {
    return await apiClient.put(`/v1/api/quiz/update/${id}`, data);
  }

  async deleteQuiz(id: string) {
    return await apiClient.delete(`/v1/api/quiz/delete/${id}`);
  }
}

export const quizService = new QuizService();
