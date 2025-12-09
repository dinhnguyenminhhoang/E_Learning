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

export interface UserWord {
  _id: string;
  user: string;
  word: string;
  meaningVi: string;
  pronunciation?: string;
  example?: string;
  exampleVi?: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other";
  level: "beginner" | "intermediate" | "advanced";
  tags: string[];
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWordBookmark {
  _id: string;
  user: string;
  word: Word;
  bookmarkedAt: string;
  source: "lesson" | "block" | "manual" | "other";
  sourceBlock?: string;
  notes?: string;
  masteryLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface CombinedVocabulary {
  customWords: UserWord[];
  bookmarkedWords: UserWordBookmark[];
  systemWords: Word[];
  stats: {
    customWordsCount: number;
    bookmarkedCount: number;
    systemWordsCount: number;
  };
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

  async getMyCustomWords(params?: { level?: string; type?: string; search?: string; tags?: string; pageNum?: number; pageSize?: number }) {
    return await apiClient.get("/v1/api/vocabulary/my-words", { params });
  }

  async createCustomWord(data: Omit<UserWord, "_id" | "user" | "createdAt" | "updatedAt" | "deleted">) {
    return await apiClient.post("/v1/api/vocabulary/my-words", data);
  }

  async updateCustomWord(wordId: string, data: Partial<UserWord>) {
    return await apiClient.put(`/v1/api/vocabulary/my-words/${wordId}`, data);
  }

  async deleteCustomWord(wordId: string) {
    return await apiClient.delete(`/v1/api/vocabulary/my-words/${wordId}`);
  }

  async getBookmarkedWords(params?: { source?: string; masteryLevel?: number; pageNum?: number; pageSize?: number }) {
    return await apiClient.get("/v1/api/vocabulary/bookmarks", { params });
  }

  async toggleBookmark(wordId: string, source?: string, sourceBlock?: string) {
    return await apiClient.post(`/v1/api/vocabulary/bookmarks/${wordId}`, { source, sourceBlock });
  }

  async updateBookmarkNotes(wordId: string, notes?: string, masteryLevel?: number) {
    return await apiClient.put(`/v1/api/vocabulary/bookmarks/${wordId}/notes`, { notes, masteryLevel });
  }

  async getAllVocabulary() {
    return await apiClient.get("/v1/api/vocabulary/all");
  }
}


export const wordService = new WordService();
