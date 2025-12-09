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
  difficulty?: number;
  frequency?: number;
  status?: string;
  createdAt?: string;
}

export interface WordQueryParams {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  level?: string; // 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
  categories?: string | string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedWordResponse {
  status: string;
  message: string;
  data: Word[];
  pagination: {
    total: number;
    pageNum: number;
    pageSize: number;
    totalPages: number;
  };
  code: number;
  timestamp: string;
}

class WordService {
  async createWord(data: Partial<Word>) {
    return await apiClient.post("/v1/api/word/create", data);
  }

  async getAllWords(query?: WordQueryParams): Promise<PaginatedWordResponse> {
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
