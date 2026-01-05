const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("accessToken") || "";
    }
    return "";
};

export interface ListeningQuestion {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export interface ListeningPracticeSubmission {
    blockId?: string;
    lessonId?: string;
    mediaTitle?: string;
    questions: ListeningQuestion[];
    totalQuestions: number;
    correctAnswers: number;
}

export interface ListeningPracticeResult {
    attemptId: string;
    accuracy: number;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
}

export interface ListeningStats {
    totalAttempts: number;
    avgAccuracy: number;
    recentAttempts: Array<{
        accuracy: number;
        score: number;
        completedAt: string;
    }>;
}

const submitListeningPractice = async (
    submission: ListeningPracticeSubmission
): Promise<ListeningPracticeResult> => {
    const token = getToken();

    const response = await fetch(`${getBaseUrl()}/v1/api/listening-practice/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(submission)
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Listening practice submission failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(result.message || "Listening practice submission failed");
    }

    return result.data;
};

const getListeningStats = async (): Promise<ListeningStats> => {
    const token = getToken();

    const response = await fetch(`${getBaseUrl()}/v1/api/listening-practice/stats`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || `Failed to get listening stats with status ${response.status}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(result.message || "Failed to get listening stats");
    }

    return result.data;
};

export const listeningPracticeService = {
    submitListeningPractice,
    getListeningStats,
};

export default listeningPracticeService;
