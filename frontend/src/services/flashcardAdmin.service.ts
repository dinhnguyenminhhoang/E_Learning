import { CardDeck, CreateCardDeckInput, FlashCard } from "@/types/admin";
import { apiClient } from "@/config/api.config";

class FlashcardAdminService {
    // Card Deck APIs
    async getAll(params?: { pageNum?: number; pageSize?: number; search?: string }): Promise<{ code: number; data: CardDeck[]; pagination?: any }> {
        return await apiClient.get("/v1/api/card-deck/", {
            params,
            timeout: 60000, // kéo dài timeout để tránh ECONNABORTED khi tải nhiều deck
        });
    }

    async getById(id: string, incrementView = false): Promise<{ code: number; data: CardDeck | null }> {
        return await apiClient.get(`/v1/api/card-deck/${id}`, {
            params: { incrementView },
        });
    }

    async create(input: CreateCardDeckInput): Promise<{ code: number; data: CardDeck }> {
        return await apiClient.post("/v1/api/card-deck/", input);
    }

    async update(
        id: string,
        input: Partial<CreateCardDeckInput>
    ): Promise<{ code: number; data: CardDeck | null }> {
        return await apiClient.put(`/v1/api/card-deck/${id}`, input);
    }

    async delete(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.delete(`/v1/api/card-deck/${id}`);
    }

    async getByCategory(categoryId: string): Promise<{ code: number; data: CardDeck[] }> {
        return await apiClient.get(`/v1/api/card-deck/category/${categoryId}`);
    }

    // FlashCard APIs (individual cards)
    async getAllFlashcards(): Promise<{ code: number; data: FlashCard[] }> {
        return await apiClient.get("/v1/api/flashcard/");
    }

    async getFlashcardById(id: string, incrementView = false): Promise<{ code: number; data: FlashCard | null }> {
        return await apiClient.get(`/v1/api/flashcard/getById/${id}`, {
            params: { incrementView },
        });
    }

    async createFlashcard(input: any): Promise<{ code: number; data: FlashCard }> {
        return await apiClient.post("/v1/api/flashcard/create", input);
    }

    async updateFlashcard(
        id: string,
        input: any
    ): Promise<{ code: number; data: FlashCard | null }> {
        return await apiClient.put(`/v1/api/flashcard/${id}`, input);
    }

    async deleteFlashcard(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.delete(`/v1/api/flashcard/delete/${id}`);
    }

    // ===== STATISTICS METHODS =====
    async incrementCardDeckView(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.post(`/v1/api/card-deck/${id}/increment-view`);
    }

    async incrementCardDeckStudy(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.post(`/v1/api/card-deck/${id}/increment-study`);
    }

    async updateCardDeckCardCount(id: string): Promise<{ code: number; data: { cardCount: number } }> {
        return await apiClient.post(`/v1/api/card-deck/${id}/update-card-count`);
    }

    async incrementFlashcardView(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.post(`/v1/api/flashcard/${id}/increment-view`);
    }

    async incrementFlashcardStudy(id: string): Promise<{ code: number; message: string }> {
        return await apiClient.post(`/v1/api/flashcard/${id}/increment-study`);
    }
}

export const flashcardAdminService = new FlashcardAdminService();
