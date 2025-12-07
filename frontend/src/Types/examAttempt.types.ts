export interface Question {
    _id: string;
    type: "multiple_choice" | "fill_blank" | "true_false" | "writing" | "speaking";
    questionText: string;
    options?: Array<{ text: string }>;
    points: number;
    explanation?: string;
    correctAnswer?: string;
    tags?: string[];
    thumbnail?: string;
    audio?: string;
}

export interface Answer {
    questionId: string;
    selectedAnswer?: string;
    writingAnswer?: {
        text: string;
        wordCount: number;
    };
    speakingAnswer?: {
        audioUrl: string;
        duration: number;
    };
    timeSpent: number;
}

export interface SectionAttempt {
    sectionId: string;
    quizAttempt: string;
    status: "in_progress" | "completed";
    timeSpent: number;
    score: number;
    percentage: number;
}

export interface ExamAttempt {
    _id: string;
    exam: string;
    user: string;
    status: "in_progress" | "completed";
    sections: SectionAttempt[];
    totalScore: number;
    totalPercentage: number;
    totalTimeSpent: number;
    startedAt: string;
    completedAt?: string;
}

export interface SectionQuestionsResponse {
    status: string;
    data: {
        sectionId: string;
        skill: string;
        timeLimit: number;
        remainingTime: number;
        questions: Question[];
    };
    code: number;
}

export interface StartExamResponse {
    status: string;
    data: ExamAttempt;
    code: number;
}

export interface SubmitSectionRequest {
    answers: Answer[];
    timeSpent: number;
}

export interface SubmitSectionResponse {
    status: string;
    message: string;
    data: {
        sectionId: string;
        timeSpent: number;
        hasMoreSections: boolean;
        remainingSectionsCount: number;
        totalSections: number;
        completedSectionsCount: number;
    };
    code: number;
}

export interface CompleteExamResponse {
    status: string;
    data: {
        attemptId: string;
        totalScore: number;
        totalPercentage: number;
        completedAt: string;
        sections: Array<{
            sectionId: string;
            skill: string;
            score: number;
            percentage: number;
            writingGradings?: any[];
        }>;
    };
    code: number;
}

export interface ExamResultResponse {
    status: string;
    data: ExamAttempt & {
        sections: Array<SectionAttempt & {
            answers?: any[];
            writingGrading?: any;
        }>;
    };
    code: number;
}
