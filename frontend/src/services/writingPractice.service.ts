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
}

export const writingPracticeService = new WritingPracticeService();
export default writingPracticeService;
