export interface ExamSection {
    _id?: string;
    title: string;
    skill: "listening" | "reading" | "writing" | "speaking";
    quiz: string | { _id: string; title: string };
    order: number;
    timeLimit?: number;
}

export interface Exam {
    _id: string;
    title: string;
    description?: string;
    totalTimeLimit: number;
    sections: ExamSection[];
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface CreateExamRequest {
    title: string;
    description?: string;
    totalTimeLimit: number;
    sections: Omit<ExamSection, "_id">[];
    status?: "draft" | "active" | "inactive";
}

export interface UpdateExamRequest {
    title?: string;
    description?: string;
    totalTimeLimit?: number;
    sections?: Omit<ExamSection, "_id">[];
    status?: "draft" | "active" | "inactive";
}

export interface ExamResponse {
    status: string;
    message?: string;
    data: Exam;
    code: number;
}

export interface ExamListResponse {
    status: string;
    message?: string;
    data: {
        exams: Exam[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    code: number;
}

export interface DeleteExamResponse {
    status: string;
    message: string;
    code: number;
}
