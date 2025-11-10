import { apiClient } from "@/config/api.config";

export interface Flashcard {
  _id: string;
  word: string;
  frontText: string;
  backText: string;
  cardDeck: string;
  difficulty: string;
  tags?: string[];
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
}

export const flashcardService = new FlashcardService();
