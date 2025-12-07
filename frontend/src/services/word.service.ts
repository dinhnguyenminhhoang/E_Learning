import { apiClient } from "@/config/api.config";

export interface Word {
  _id: string;
  word: string;
  pronunciation?: string;
  audio?: string;
  partOfSpeech: string;
  level: string;
  definitions: Array<{
    meaning: string;
    meaningVi: string;
    examples: Array<{
      sentence: string;
      translation: string;
      audio?: string;
    }>;
  }>;
  synonyms?: string[];
  antonyms?: string[];
  categories: string[];
  tags?: string[];
  image?: string;
}

class WordService {
  async createWord(data: Partial<Word>) {
    return await apiClient.post("/v1/api/word/create", data);
  }

  async getAllWords(query?: any) {
    return await apiClient.get("/v1/api/word/", { params: query });
  }

  async getWordById(wordId: string) {
    return await apiClient.get(`/v1/api/word/${wordId}`);
  }

  async getWordsByCategory(categoryId: string, query?: any) {
    return await apiClient.get(`/v1/api/word/category/${categoryId}`, {
      params: query,
    });
  }

  async updateWord(wordId: string, data: Partial<Word>) {
    return await apiClient.put(`/v1/api/word/${wordId}`, data);
  }

  async deleteWord(wordId: string) {
    return await apiClient.delete(`/v1/api/word/delete/${wordId}`);
  }

  async importWords(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return await apiClient.post("/v1/api/word/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async exportSample() {
    return await apiClient.get("/v1/api/word/export-sample", {
      responseType: "blob",
    });
  }
}

export const wordService = new WordService();
