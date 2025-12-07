export interface StartBlockResponse {
    status: string;
    message: string;
    data: any;
    code: number;
}

export interface VideoHeartbeatResponse {
    status: string;
    message: {
        message: string;
        data: {
            isCompleted: boolean;
            isLearned: boolean;
            maxWatchedTime: number;
            videoDuration: number;
            progressPercentage: number;
        };
    };
    data: null;
    code: number;
}

export interface QuizQuestion {
    _id: string;
    sourceType: string;
    sourceId: string;
    type: string;
    questionText: string;
    options: Array<{ text: string }>;
    points: number;
    explanation: string;
    correctAnswer?: string | null;
    tags?: string[];
    thumbnail?: string | null;
    audio?: string | null;
}

export interface QuizAttempt {
    _id: string;
    user: string;
    quiz: {
        _id: string;
        title: string;
        questions: QuizQuestion[];
        xpReward: number;
        difficulty: string;
        status: string;
    };
    block: string;
    userBlockProgress: string;
    score: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
    isPassed: boolean;
    timeSpent: number;
    status: string;
    completedAt: string | null;
    updatedAt: string;
    updatedBy: string | null;
    answers: any[];
    startedAt: string;
    createdAt: string;
}

export interface StartQuizResponse {
    status: string;
    message: string;
    data: {
        attempt: QuizAttempt;
        quiz: QuizAttempt["quiz"];
    };
    code: number;
}

export interface QuizAnswer {
    questionId: string;
    selectedAnswer: string;
    timeSpent?: number;
}

export interface SubmitQuizResponse {
    status: string;
    message: string;
    data: {
        attempt: QuizAttempt;
        isBlockCompleted: boolean;
    };
    code: number;
}
