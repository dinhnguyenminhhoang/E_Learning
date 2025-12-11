export interface Question {
    _id: string;
    type: "multiple_choice" | "fill_blank" | "true_false" | "writing" | "speaking" | "matching";
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

export interface ExamSection {
    sectionId: string;
    skill: string;
    status: "in_progress" | "completed";
    score: number;
    percentage: number;
    timeSpent: number;
    questions: Question[];
}

export interface StartExamResponse {
    status: string;
    data: {
        exam: {
            _id: string;
            attemptId: string;
            timeSpent: number;
            startAt: string;
            status: "in_progress" | "completed";
            totalScore: number;
            totalPercentage: number;
            totalTimeLimit?: number | null;
        };
        sections: ExamSection[];
    };
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

export interface QuestionReview {
    questionId: string;
    questionText: string;
    questionType: Question["type"];
    points: number;
    pointsEarned: number;
    isCorrect: boolean;
    userAnswer: Answer & {
        matches?: Array<{ key: string; value: string }>;
    };
    correctAnswer?: {
        text?: string;
        matches?: Array<{ key: string; value: string }>;
        options?: Array<{ text: string; isCorrect: boolean }>;
    };
    writingGrading?: {
        grading: {
            score: number;
            level: string;
            overall_comment: string;
            suggestions: string[];
        };
        grammar_errors: Array<{
            message: string;
            shortMessage: string;
            replacements: Array<{ value: string }>;
            offset: number;
            length: number;
            context?: {
                text: string;
                offset: number;
                length: number;
            };
            sentence?: string;
            rule?: {
                id: string;
                description: string;
                issueType: string;
                category?: {
                    id: string;
                    name: string;
                };
            };
        }>;
        original_text?: string;
    };
}

export interface ExamResultResponse {
    status: string;
    data: ExamAttempt & {
        sections: Array<SectionAttempt & {
            answers?: any[];
            writingGrading?: any;
            detailedQuestions?: QuestionReview[];
        }>;
    };
    code: number;
}
