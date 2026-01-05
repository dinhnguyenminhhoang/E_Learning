import { apiClient } from "@/config/api.config";

export interface GrammarError {
    message: string;
    shortMessage: string;
    replacements: Array<{ value: string }>;
    offset: number;
    length: number;
}

export interface GradingResult {
    score: number;
    level: string;
    overall_comment: string;
    suggestions: string[];
    detailed_analysis?: {
        vocabulary: { score: number; comment: string };
        grammar: { score: number; comment: string };
        coherence: { score: number; comment: string };
        relevance: { score: number; comment: string };
    };
    improvement_plan?: string;
    translated_text?: string;
}

export interface GradeWritingResponse {
    grammar_errors: GrammarError[];
    grading?: GradingResult;
}

export interface WritingPracticeSubmission {
    templateId?: string;
    prompt?: string;
    userText: string;
    feedback?: {
        score?: number;
        grammarErrors?: Array<{
            error: string;
            suggestion: string;
            position: number;
        }>;
        vocabularyFeedback?: string;
        structureFeedback?: string;
        overallFeedback?: string;
    };
}

export interface WritingPracticeResult {
    attemptId: string;
    score: number;
    wordCount: number;
    grammarErrorCount: number;
}

export interface WritingStats {
    totalAttempts: number;
    avgScore: number;
    totalWords: number;
    recentAttempts: Array<{
        score: number;
        wordCount: number;
        grammarErrorCount: number;
        completedAt: string;
    }>;
}

class WritingPracticeService {
    async gradeWriting(text: string, context?: { topic?: string; prompt?: string }, language: string = "en-US"): Promise<GradeWritingResponse> {
        const response = await apiClient.post<any>("/v1/api/ai/grade-writing-gpt", {
            text,
            language,
            topic: context?.topic,
            prompt: context?.prompt
        });

        return response.metadata;
    }

    async submitWritingPractice(submission: WritingPracticeSubmission): Promise<WritingPracticeResult> {
        const response = await apiClient.post<any>("/v1/api/writing-practice/submit", submission);
        return response.metadata;
    }

    async getWritingStats(): Promise<WritingStats> {
        const response = await apiClient.get<any>("/v1/api/writing-practice/stats");
        return response.metadata;
    }
}

export const writingPracticeService = new WritingPracticeService();
export default writingPracticeService;
