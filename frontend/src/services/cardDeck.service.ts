import { apiClient } from "@/config/api.config";

export interface CardDeck {
  _id: string;
  title: string;
  description?: string;
  target: string;
  level: string;
  categoryId: string;
  thumbnail?: string;
  status: string;
}

class CardDeckService {
  async getCardDeck(cardDeckId: string) {
    return await apiClient.get(`/v1/api/card-deck/${cardDeckId}`);
  }

  async createCardDeck(data: Partial<CardDeck>) {
    return await apiClient.post("/v1/api/card-deck/", data);
  }

  async updateCardDeck(cardDeckId: string, data: Partial<CardDeck>) {
    return await apiClient.put(`/v1/api/card-deck/${cardDeckId}`, data);
  }

  async deleteCardDeck(cardDeckId: string) {
    return await apiClient.delete(`/v1/api/card-deck/${cardDeckId}`);
  }

  async getListCardDecks(query?: any) {
    return await apiClient.get("/v1/api/card-deck/", { params: query });
  }

  async getCardDeckByCategory(categoryId: string) {
    return await apiClient.get(`/v1/api/card-deck/category/${categoryId}`);
  }
}

export const cardDeckService = new CardDeckService();
