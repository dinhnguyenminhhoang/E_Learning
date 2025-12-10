import { apiClient } from "@/config/api.config";

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
}

export interface Conversation {
    _id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages?: ChatMessage[];
}

export interface ChatResponse {
    conversationId: string;
    message: {
        role: "assistant";
        content: string;
        tokensUsed?: number;
    };
}

export interface GrammarResponse {
    role: "assistant";
    content: string;
    type: "grammar";
}

export interface VocabularyResponse {
    role: "assistant";
    content: string;
    type: "vocabulary";
}

class AIAssistantService {
    /**
     * Send a message to the AI assistant
     */
    async chat(message: string, conversationId?: string): Promise<ChatResponse> {
        const response = await apiClient.post<any>("/v1/api/ai-assistant/chat", {
            message,
            conversationId,
        });
        return response.metadata;
    }

    /**
     * Check and correct grammar
     */
    async correctGrammar(text: string): Promise<GrammarResponse> {
        const response = await apiClient.post<any>("/v1/api/ai-assistant/grammar/correct", {
            text,
        });
        return response.metadata;
    }

    /**
     * Explain vocabulary word
     */
    async explainVocabulary(word: string, context?: string): Promise<VocabularyResponse> {
        const response = await apiClient.post<any>("/v1/api/ai-assistant/vocabulary/explain", {
            word,
            context,
        });
        return response.metadata;
    }

    /**
     * Get user's conversation list
     */
    async getConversations(limit: number = 20): Promise<Conversation[]> {
        const response = await apiClient.get<any>(`/v1/api/ai-assistant/conversations?limit=${limit}`);
        return response.metadata || [];
    }

    /**
     * Get single conversation with messages
     */
    async getConversation(conversationId: string): Promise<Conversation> {
        const response = await apiClient.get<any>(`/v1/api/ai-assistant/conversations/${conversationId}`);
        return response.metadata;
    }

    /**
     * Create new conversation
     */
    async createConversation(title?: string): Promise<Conversation> {
        const response = await apiClient.post<any>("/v1/api/ai-assistant/conversations", {
            title,
        });
        return response.metadata;
    }

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        await apiClient.delete(`/v1/api/ai-assistant/conversations/${conversationId}`);
    }
}

export const aiAssistantService = new AIAssistantService();
