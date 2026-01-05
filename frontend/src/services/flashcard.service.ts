import { apiClient } from "@/config/api.config";

export interface Flashcard {
  _id: string;
  word: string;
  frontText: string;
  backText: string;
  cardDeck: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
  // Media fields
  images?: string[];
  audio?: string;
  hint?: string;
  explanation?: string;
  // Statistics
  viewCount?: number;
  studyCount?: number;
  // Status & metadata
  status?: "active" | "inactive";
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

class FlashcardService {
  async createFlashcard(data: Partial<Flashcard>) {
    return await apiClient.post("/v1/api/flashcard/create", data);
  }

  async listFlashcards() {
    return await apiClient.get("/v1/api/flashcard/");
  }

  async getFlashcardById(id: string) {
    return await apiClient.get(`/v1/api/flashcard/getById/${id}`);
  }

  async updateFlashcard(id: string, data: Partial<Flashcard>) {
    return await apiClient.put(`/v1/api/flashcard/${id}`, data);
  }

  async deleteFlashcard(id: string) {
    return await apiClient.delete(`/v1/api/flashcard/delete/${id}`);
  }

  // Statistics methods
  async incrementFlashcardView(id: string) {
    return await apiClient.post(`/v1/api/flashcard/${id}/increment-view`);
  }

  async incrementFlashcardStudy(id: string) {
    return await apiClient.post(`/v1/api/flashcard/${id}/increment-study`);
  }
}

export const flashcardService = new FlashcardService();
